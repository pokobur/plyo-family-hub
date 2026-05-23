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

  const mockDb = [
    { title: "エルゴベビー ベビーキャリア OMNI Breeze", imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "33990", url: "https://item.rakuten.co.jp/ergobaby/omni-breeze/", platform: "楽天" },
    { title: "パンパース オムツ さらさらケア (9-14kg) 174枚", imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "4980", url: "https://item.rakuten.co.jp/pampers/diapers/", platform: "楽天" },
    { title: "ストッケ トリップトラップ ベビーセット付", imageUrl: "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "38940", url: "https://item.rakuten.co.jp/stokke/tripp-trapp/", platform: "楽天" },
    { title: "ピジョン ランフィ Runfee RB3 (A型ベビーカー)", imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "64900", url: "https://item.rakuten.co.jp/pigeon/runfee/", platform: "楽天" },
    { title: "明治 ほほえみ らくらくキューブ 48袋", imageUrl: "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "4280", url: "https://item.rakuten.co.jp/meiji/hohoemi/", platform: "楽天" },
    { title: "日本育児 ベビーサークル ミュージカルキッズランドDX", imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", price: "12800", url: "https://item.rakuten.co.jp/nihonikuji/circle/", platform: "楽天" },
  ];

  const getFallback = () => {
    const filtered = mockDb.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(item.title.toLowerCase().substring(0, 3))
    );
    if (filtered.length > 0) return filtered;
    
    return [
      {
        title: `${keyword} (おすすめ・定番モデル)`,
        imageUrl: "https://images.unsplash.com/photo-1515488042361-404e9250afef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        price: "2980",
        url: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`,
        platform: '楽天'
      },
      {
        title: `${keyword} (高評価レビューモデル)`,
        imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        price: "4980",
        url: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`,
        platform: '楽天'
      },
      {
        title: `${keyword} (人気ギフトモデル)`,
        imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        price: "8800",
        url: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`,
        platform: '楽天'
      }
    ];
  };

  const url = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Rakuten search page: ${res.status}`);
    }
    const html = await res.text();
    const cards = html.split('searchresultitem');
    const parsedItems = [];
    
    for (let i = 1; i < cards.length && parsedItems.length < 10; i++) {
      const chunk = cards[i].substring(0, 4000);
      
      const imgMatch = chunk.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
      const altMatch = chunk.match(/alt="([^"]+)"/i);
      
      const linkMatch = chunk.match(/href="([^"]+item\.rakuten\.co\.jp\/[^"]+)"/i) || 
                        chunk.match(/href="([^"]+grp\d+\.ias\.rakuten\.co\.jp\/[^"]+)"/i) ||
                        chunk.match(/href="([^"]+hb\.afl\.rakuten\.co\.jp\/[^"]+)"/i);
      
      const priceMatch = chunk.match(/data-track-price="(\d+)"/i) || 
                         chunk.match(/class="price--[^"]+">([\d,]+)円/i);
      
      let imageUrl = imgMatch ? imgMatch[1] : '';
      let title = altMatch ? altMatch[1] : '';
      let itemUrl = linkMatch ? linkMatch[1] : '';
      let price = priceMatch ? priceMatch[1] : '';
      
      if (title && !title.includes('楽天市場') && itemUrl && imageUrl) {
        title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        parsedItems.push({
          title,
          imageUrl: imageUrl.replace(/&amp;/g, '&'),
          url: itemUrl.replace(/&amp;/g, '&'),
          price,
          platform: '楽天'
        });
      }
    }
    if (parsedItems.length > 0) {
      return parsedItems;
    }
    return getFallback();
  } catch (error) {
    console.error('Error searching products:', error);
    return getFallback();
  }
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
