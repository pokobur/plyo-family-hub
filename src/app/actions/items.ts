'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Security: Validate inputs strictly
const ItemFormSchema = z.object({
  original_url: z.string().url("有効なURLを入力してください").max(1000, "URLが長すぎます"),
  category: z.string().min(1, "カテゴリを選択してください"),
  rating: z.coerce.number().min(1).max(5),
  description: z.string().min(10, "おすすめの理由は10文字以上必要です").max(2000, "2000文字以内で入力してください"),
})

export async function createItem(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    original_url: formData.get('original_url'),
    category: formData.get('category'),
    rating: formData.get('rating'),
    description: formData.get('description'),
  }

  // Security: Zod validation
  const validatedData = ItemFormSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: '入力内容にエラーがあります。',
    }
  }

  // --- Logic for extracting item info based on URL ---
  const urlString = validatedData.data.original_url
  let platform = 'その他'
  let affiliate_url = urlString

  if (urlString.includes('amazon.co.jp') || urlString.includes('amzn.to')) {
    platform = 'Amazon'
    const moshimoAmazonId = process.env.MOSHIMO_AMAZON_ID || '1234567' // もしもアフィリエイトのAmazon用a_id
    // もしもアフィリエイト「どこでもリンク」のAmazon基本フォーマット
    affiliate_url = `https://af.moshimo.com/af/c/click?a_id=${moshimoAmazonId}&p_id=170&pc_id=185&pl_id=4062&url=${encodeURIComponent(urlString)}`
  } else if (urlString.includes('rakuten.co.jp')) {
    platform = '楽天'
    const moshimoRakutenId = process.env.MOSHIMO_RAKUTEN_ID || '1234567' // もしもアフィリエイトの楽天用a_id
    // もしもアフィリエイト「どこでもリンク」の楽天基本フォーマット
    affiliate_url = `https://af.moshimo.com/af/c/click?a_id=${moshimoRakutenId}&p_id=54&pc_id=54&pl_id=27059&url=${encodeURIComponent(urlString)}`
  }

  // Fetch OGP data (Title and Image) using a simple fetch & regex approach
  let title = "ユーザー推薦アイテム" 
  let image_url = "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  
  try {
    const response = await fetch(urlString, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } 
    });
    if (response.ok) {
      const html = await response.text();
      
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
      if (ogImageMatch && ogImageMatch[1]) {
        image_url = ogImageMatch[1];
      }
    }
  } catch (error) {
    console.error('Failed to fetch OGP data:', error);
  }
  
  const { data, error } = await supabase
    .from('items')
    .insert({
      original_url: validatedData.data.original_url,
      affiliate_url,
      category: validatedData.data.category,
      rating: validatedData.data.rating,
      description: validatedData.data.description,
      platform,
      title,
      image_url,
      author: '匿名パパママ'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to insert item:', error)
    return { message: 'データベースエラーが発生しました。' }
  }

  revalidatePath('/items')
  redirect(`/items/${data.id}`)
}

export async function getItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
    return []
  }
  return data
}

export async function getItem(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching item:', error)
    return null
  }
  return data
}
