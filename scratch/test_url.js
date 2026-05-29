function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, "`")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function searchProductsMock(keyword) {
  if (!keyword || keyword.trim() === '') {
    return [];
  }

  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword.startsWith('http://') || trimmedKeyword.startsWith('https://')) {
    let platform = '楽天';
    if (trimmedKeyword.includes('amazon.co.jp') || trimmedKeyword.includes('amzn.to')) {
      platform = 'Amazon';
    }

    try {
      const res = await fetch(trimmedKeyword, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Detect charset
      const asciiDecoder = new TextDecoder('ascii');
      const headPart = asciiDecoder.decode(bytes.slice(0, 5000));
      const charsetMatch = headPart.match(/charset\s*=\s*["']?([a-zA-Z0-9_-]+)/i);
      let charset = 'utf-8';
      if (charsetMatch) {
        charset = charsetMatch[1].toLowerCase();
      }

      // Decode with detected charset
      let html = '';
      try {
        const decoder = new TextDecoder(charset);
        html = decoder.decode(bytes);
      } catch (e) {
        const decoder = new TextDecoder('utf-8');
        html = decoder.decode(bytes);
      }

      // Extract OGP details
      const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);

      let title = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : '');
      title = decodeHtmlEntities(title);
      title = title.replace(/^【楽天市場】/, '').trim();

      let imageUrl = ogImageMatch ? ogImageMatch[1] : '';

      // Check if blocked by Amazon bot detection
      const isAmazonBlocked = platform === 'Amazon' && (
        html.includes('api-services-support@amazon.com') ||
        html.includes('captcha') ||
        html.includes('Robot Check') ||
        html.includes('automated access') ||
        title.toLowerCase().includes('robot check')
      );

      if (isAmazonBlocked || !title) {
        console.log(`[Mock] Detected block or missing title for ${platform}. Using fallback.`);
        return [{
          title: platform === 'Amazon' ? 'Amazonの商品' : '楽天市場の商品',
          imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          url: trimmedKeyword,
          price: '',
          platform
        }];
      }

      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
      }

      return [{
        title,
        imageUrl,
        url: trimmedKeyword,
        price: '',
        platform
      }];

    } catch (err) {
      console.error(`[Mock] Failed to scrape ${platform} URL:`, err.message);
      return [{
        title: platform === 'Amazon' ? 'Amazonの商品' : '楽天市場の商品',
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        url: trimmedKeyword,
        price: '',
        platform
      }];
    }
  }

  return [];
}

async function run() {
  // Test Rakuten URL
  const rResult = await searchProductsMock('https://item.rakuten.co.jp/natural-living/u219386/');
  console.log('Rakuten result:', JSON.stringify(rResult, null, 2));

  // Test Amazon URL (which we expect to fallback gracefully)
  const aResult = await searchProductsMock('https://www.amazon.co.jp/dp/B09QXMCGF5');
  console.log('Amazon result:', JSON.stringify(aResult, null, 2));
}

run();
