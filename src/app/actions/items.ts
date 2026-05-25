'use server'

import { createClient, createReadClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

// Security: Validate inputs strictly
const ItemFormSchema = z.object({
  title: z.string().min(1, "商品名を入力してください"),
  image_url: z.string().url("画像URLが無効です"),
  original_url: z.string().url("有効なURLを入力してください").max(1000, "URLが長すぎます"),
  platform: z.string().min(1, "ショップを選択してください"),
  category: z.string().min(1, "カテゴリを選択してください"),
  rating: z.coerce.number().min(1).max(5),
  description: z.string().min(10, "おすすめの理由は10文字以上必要です").max(2000, "2000文字以内で入力してください"),
})

export async function createItem(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { message: 'ログインが必要です。' }
  }

  const rawData = {
    title: formData.get('title'),
    image_url: formData.get('image_url'),
    original_url: formData.get('original_url'),
    platform: formData.get('platform'),
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

  const { title, image_url, original_url, platform, category, rating, description } = validatedData.data

  // --- Logic for extracting item info based on URL / Platform ---
  let affiliate_url = original_url

  if (platform === 'Amazon' || original_url.includes('amazon.co.jp') || original_url.includes('amzn.to')) {
    const moshimoAmazonId = process.env.MOSHIMO_AMAZON_ID || '1234567' // もしもアフィリエイトのAmazon用a_id
    affiliate_url = `https://af.moshimo.com/af/c/click?a_id=${moshimoAmazonId}&p_id=170&pc_id=185&pl_id=4062&url=${encodeURIComponent(original_url)}`
  } else if (platform === '楽天' || original_url.includes('rakuten.co.jp')) {
    const moshimoRakutenId = process.env.MOSHIMO_RAKUTEN_ID || '1234567' // もしもアフィリエイトの楽天用a_id
    affiliate_url = `https://af.moshimo.com/af/c/click?a_id=${moshimoRakutenId}&p_id=54&pc_id=54&pl_id=27059&url=${encodeURIComponent(original_url)}`
  }

  // Set author name using custom display name (metadata) or email fallback
  const author = user.user_metadata?.nickname || user.email?.split('@')[0] || '匿名パパママ'

  const { data, error } = await supabase
    .from('items')
    .insert({
      original_url,
      affiliate_url,
      category,
      rating,
      description,
      platform,
      title,
      image_url,
      author,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to insert item:', error)
    return { message: 'データベースエラーが発生しました。' }
  }

  // Invalidate cache
  revalidateTag('items', 'max')
  revalidatePath('/items')
  
  redirect(`/items/${data.id}`)
}

export async function searchProducts(keyword: string) {
  if (!keyword || keyword.trim() === '') {
    return [];
  }

  const trimmedKeyword = keyword.trim();

  // Direct URL detection and OpenGraph metadata extraction
  if (trimmedKeyword.startsWith('http://') || trimmedKeyword.startsWith('https://')) {
    try {
      const res = await fetch(trimmedKeyword, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      if (res.ok) {
        const html = await res.text();
        
        // Extract OpenGraph tags
        const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);

        let title = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : '商品ページ');
        let imageUrl = ogImageMatch ? ogImageMatch[1] : '';

        if (!imageUrl) {
          imageUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
        }

        title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

        let platform = '楽天';
        if (trimmedKeyword.includes('amazon.co.jp') || trimmedKeyword.includes('amzn.to')) {
          platform = 'Amazon';
        }

        return [{
          title,
          imageUrl,
          url: trimmedKeyword,
          price: '',
          platform
        }];
      }
    } catch (err) {
      console.error('Failed to extract metadata from URL:', err);
      let platform = '楽天';
      if (trimmedKeyword.includes('amazon.co.jp') || trimmedKeyword.includes('amzn.to')) {
        platform = 'Amazon';
      }
      return [{
        title: '貼り付けられた商品ページ',
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        url: trimmedKeyword,
        price: '',
        platform
      }];
    }
  }

  return [];
}

export async function getItems() {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching items:', error)
        return []
      }
      return data
    },
    ['items'],
    { tags: ['items'] }
  )()
}

export async function getItem(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createReadClient()
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
    },
    ['item', id],
    { tags: [`item-${id}`] }
  )()
}
