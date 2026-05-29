'use server'

import { createClient, createReadClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

const GiftFormSchema = z.object({
  title: z.string().min(1, "商品名を入力してください").max(100, "100文字以内で入力してください"),
  description: z.string().min(10, "説明は10文字以上で入力してください").max(2000, "2000文字以内で入力してください"),
  category: z.string().min(1, "カテゴリを選択してください"),
  condition: z.string().min(1, "商品の状態を選択してください"),
  delivery_method: z.string().min(1, "受取方法を選択してください"),
  prefecture: z.string().min(1, "都道府県を入力または選択してください"),
  city: z.string().min(1, "市区町村を入力してください"),
  location_hint: z.string().max(200, "200文字以内で入力してください").optional(),
})

export async function createGiftItem(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { message: 'ログインが必要です。' }
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    condition: formData.get('condition'),
    delivery_method: formData.get('delivery_method'),
    prefecture: formData.get('prefecture'),
    city: formData.get('city'),
    location_hint: formData.get('location_hint') || undefined,
  }

  // Validate fields
  const validatedData = GiftFormSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: '入力内容にエラーがあります。',
    }
  }

  // Parse images (passed as a JSON string from client upload)
  const imagesJson = formData.get('images_json') as string
  let images: string[] = []
  try {
    if (imagesJson) {
      images = JSON.parse(imagesJson)
    }
  } catch (e) {
    console.error('Failed to parse images json:', e)
  }

  const { title, description, category, condition, delivery_method, prefecture, city, location_hint } = validatedData.data

  const { data, error } = await supabase
    .from('gift_items')
    .insert({
      user_id: user.id,
      title,
      description,
      images,
      category,
      condition,
      delivery_method,
      prefecture,
      city,
      location_hint,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create gift item:', error)
    return { message: 'データベースエラーが発生しました。' }
  }

  // Invalidate cache
  revalidateTag('gift_items', 'max')
  revalidatePath('/gifts')

  redirect(`/gifts/${data.id}`)
}

export async function applyForGift(giftItemId: string, message: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('ログインが必要です。')
  }

  if (!message || message.trim().length < 5) {
    throw new Error('メッセージは5文字以上入力してください。')
  }

  // Verify not applying to own item
  const { data: item } = await supabase
    .from('gift_items')
    .select('user_id')
    .eq('id', giftItemId)
    .single()

  if (item && item.user_id === user.id) {
    throw new Error('自身が出品したアイテムには応募できません。')
  }

  const { error } = await supabase
    .from('gift_applications')
    .insert({
      gift_item_id: giftItemId,
      applicant_id: user.id,
      message: message.trim(),
      status: 'pending'
    })

  if (error) {
    console.error('Failed to apply for gift:', error)
    if (error.code === '23505') {
      throw new Error('このアイテムには既に評価・応募済みです。')
    }
    throw new Error('応募に失敗しました。時間をおいて再度お試しください。')
  }

  revalidateTag(`gift_item-${giftItemId}`, 'max')
  revalidatePath(`/gifts/${giftItemId}`)
}

export async function confirmReceiver(giftItemId: string, applicantId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('ログインが必要です。')
  }

  // Verify owner
  const { data: item, error: itemError } = await supabase
    .from('gift_items')
    .select('user_id, status')
    .eq('id', giftItemId)
    .single()

  if (itemError || !item) {
    throw new Error('対象のアイテムが見つかりませんでした。')
  }

  if (item.user_id !== user.id) {
    throw new Error('お譲り先を決定する権限がありません。')
  }

  if (item.status !== 'open') {
    throw new Error('このアイテムは既に交渉中または取引完了となっています。')
  }

  // Transaction: Update status of application to accepted, and update item status to matched
  const { error: updateItemError } = await supabase
    .from('gift_items')
    .update({
      status: 'matched',
      selected_receiver_id: applicantId
    })
    .eq('id', giftItemId)

  if (updateItemError) {
    console.error('Failed to update gift item receiver:', updateItemError)
    throw new Error('取引の開始に失敗しました。')
  }

  await supabase
    .from('gift_applications')
    .update({ status: 'accepted' })
    .eq('gift_item_id', giftItemId)
    .eq('applicant_id', applicantId)

  // Revalidate cache
  revalidateTag('gift_items', 'max')
  revalidateTag(`gift_item-${giftItemId}`, 'max')
  revalidatePath(`/gifts/${giftItemId}`)
  revalidatePath(`/gifts/${giftItemId}/chat`)
}

export async function sendGiftMessage(giftItemId: string, text: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('ログインが必要です。')
  }

  if (!text || text.trim() === '') {
    throw new Error('メッセージ内容が空です。')
  }

  const { error } = await supabase
    .from('gift_messages')
    .insert({
      gift_item_id: giftItemId,
      sender_id: user.id,
      message: text.trim()
    })

  if (error) {
    console.error('Failed to send message:', error)
    throw new Error('メッセージの送信に失敗しました。')
  }

  revalidatePath(`/gifts/${giftItemId}/chat`)
}

export async function completeGiftTransaction(giftItemId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('ログインが必要です。')
  }

  const { data: item, error: itemError } = await supabase
    .from('gift_items')
    .select('user_id, selected_receiver_id, status')
    .eq('id', giftItemId)
    .single()

  if (itemError || !item) {
    throw new Error('アイテムが見つかりませんでした。')
  }

  // Either owner or recipient can trigger completion, or both
  if (item.user_id !== user.id && item.selected_receiver_id !== user.id) {
    throw new Error('この取引を完了する権限がありません。')
  }

  const { error } = await supabase
    .from('gift_items')
    .update({ status: 'completed' })
    .eq('id', giftItemId)

  if (error) {
    console.error('Failed to complete transaction:', error)
    throw new Error('取引の完了処理に失敗しました。')
  }

  revalidateTag('gift_items', 'max')
  revalidateTag(`gift_item-${giftItemId}`, 'max')
  revalidatePath(`/gifts/${giftItemId}`)
  revalidatePath(`/gifts/${giftItemId}/chat`)
}

// Caching helper actions
export async function getGiftItems() {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
      const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching gift items:', error)
        return []
      }
      return data
    },
    ['gift_items'],
    { tags: ['gift_items'] }
  )()
}

export async function getGiftItem(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
      
      // Fetch item
      const { data: item, error: itemError } = await supabase
        .from('gift_items')
        .select('*')
        .eq('id', id)
        .single()

      if (itemError || !item) {
        console.error('Error fetching gift item:', itemError)
        return null
      }

      return item
    },
    ['gift_item', id],
    { tags: [`gift_item-${id}`] }
  )()
}
