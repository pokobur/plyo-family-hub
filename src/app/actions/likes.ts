'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function toggleQuestionLike(questionId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, requireLogin: true, message: 'いいねするにはログインが必要です。' }
  }

  // Check if like exists
  const { data: existingLike, error: selectError } = await supabase
    .from('question_likes')
    .select('id')
    .eq('question_id', questionId)
    .eq('user_id', user.id)
    .maybeSingle()

  let isLiked = false

  if (existingLike) {
    // Unlike
    await supabase
      .from('question_likes')
      .delete()
      .eq('id', existingLike.id)
    isLiked = false
  } else {
    // Like
    await supabase
      .from('question_likes')
      .insert({
        question_id: questionId,
        user_id: user.id,
      })
    isLiked = true
  }

  // Get total like count
  const { count } = await supabase
    .from('question_likes')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId)

  const newCount = count ?? 0

  // Update questions count column
  await supabase
    .from('questions')
    .update({ likes: newCount })
    .eq('id', questionId)

  revalidateTag(`question-${questionId}`, 'max')
  revalidateTag('questions', 'max')
  revalidatePath(`/qa/${questionId}`)
  revalidatePath('/qa')

  return { success: true, isLiked, likesCount: newCount }
}

export async function toggleItemLike(itemId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, requireLogin: true, message: '参考になった！を押すにはログインが必要です。' }
  }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('item_likes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', user.id)
    .maybeSingle()

  let isLiked = false

  if (existingLike) {
    // Unlike
    await supabase
      .from('item_likes')
      .delete()
      .eq('id', existingLike.id)
    isLiked = false
  } else {
    // Like
    await supabase
      .from('item_likes')
      .insert({
        item_id: itemId,
        user_id: user.id,
      })
    isLiked = true
  }

  // Get total count
  const { count } = await supabase
    .from('item_likes')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)

  const newCount = count ?? 0

  // Update items count column
  await supabase
    .from('items')
    .update({ likes: newCount })
    .eq('id', itemId)

  revalidateTag(`item-${itemId}`, 'max')
  revalidateTag('items', 'max')
  revalidatePath(`/items/${itemId}`)
  revalidatePath('/items')

  return { success: true, isLiked, likesCount: newCount }
}

export async function checkUserLiked(targetId: string, type: 'question' | 'item') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const tableName = type === 'question' ? 'question_likes' : 'item_likes'
  const colName = type === 'question' ? 'question_id' : 'item_id'

  const { data } = await supabase
    .from(tableName)
    .select('id')
    .eq(colName, targetId)
    .eq('user_id', user.id)
    .maybeSingle()

  return !!data
}
