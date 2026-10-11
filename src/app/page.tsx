import Link from "next/link";
import { ArrowRight, ChevronRight, Gamepad2, Star, MessageCircle, Heart, Gift, Sparkles, BookOpen } from "lucide-react";
import { getQuestions } from "@/app/actions/qa";
import { getItems } from "@/app/actions/items";
import { getGiftItems } from "@/app/actions/gifts";
import AffiliateProductCard from "@/components/shared/AffiliateProductCard";

export default async function Home() {
  const allQuestions = await getQuestions();
  const allItems = await getItems();
  const allGifts = await getGiftItems();

  const recentQuestions = allQuestions.slice(0, 4);
  const recentItems = allItems.slice(0, 2);
  const recentGifts = allGifts.filter((item: any) => item.status === 'open').slice(0, 3);

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f9f3ed] via-[#fbf7f2] to-[#f4ebe2] p-8 md:p-12 border border-stone-200/80 shadow-2xs">
        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-stone-200/60 rounded-full text-xs font-bold text-stone-700 w-fit shadow-2xs">
            <Sparkles size={13} className="text-primary" />
            <span>家族みんなの暮らしを支えるコミュニティ</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight">
            子育ての悩みをわかち合い、<br className="hidden sm:inline" />
            まいにちを少しあたたかく。
          </h1>

          <p className="text-sm md:text-base text-stone-600 font-medium leading-relaxed">
            リアルな悩みを相談できる「知恵袋」、サイズアウト品を譲り合う「おさがりボード」、先輩パパママ厳選の「神アイテム」が集まる子育て支援ポータルです。
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              href="/qa" 
              className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle size={17} />
              悩みを相談する
            </Link>
            <Link 
              href="/gifts" 
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Gift size={17} className="text-secondary" />
              おさがりを譲り合う
            </Link>
            <Link 
              href="/items" 
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Star size={17} className="text-amber-500" />
              おすすめアイテム
            </Link>
          </div>
        </div>
      </section>

      {/* Main 2-column layout */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: UGC Content */}
        <div className="md:col-span-2 flex flex-col gap-10">
          
          {/* Q&A Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <MessageCircle className="text-primary" size={20} />
                  新着の子育て知恵袋
                </h2>
                <p className="text-stone-500 text-xs mt-0.5">リアルな悩みと先輩パパママのアドバイス</p>
              </div>
              <Link href="/qa" className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors">
                もっと見る <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentQuestions.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center text-stone-400 text-sm font-medium border border-stone-200">
                  まだ質問がありません。
                </div>
              ) : (
                recentQuestions.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/qa/${item.id}`} 
                    className="bg-white p-4.5 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          {new Date(item.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-800 group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-medium shrink-0">
                      <span className="flex items-center gap-1 text-stone-500">
                        <MessageCircle size={14} /> {item.answers?.[0]?.count || 0}件の回答
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Gift Board Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Gift className="text-secondary" size={20} />
                  新着のおさがり・お譲り
                </h2>
                <p className="text-stone-500 text-xs mt-0.5">無料でゆずり合う地域のあたたかいバトン</p>
              </div>
              <Link href="/gifts" className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors">
                もっと見る <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentGifts.length === 0 ? (
                <div className="col-span-3 bg-white p-6 rounded-xl text-center text-stone-400 text-sm font-medium border border-stone-200">
                  受付中のお譲りアイテムはありません。
                </div>
              ) : (
                recentGifts.map((item: any) => {
                  const firstImage = item.images && item.images.length > 0
                    ? item.images[0]
                    : "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

                  return (
                    <Link 
                      key={item.id} 
                      href={`/gifts/${item.id}`} 
                      className="bg-white p-3 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all flex flex-col gap-2.5 shadow-2xs group"
                    >
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-100 relative shrink-0">
                        <img src={firstImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-stone-900/80 text-white backdrop-blur-xs">
                          {item.delivery_method}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 justify-between">
                        <h3 className="font-bold text-xs text-stone-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium border-t border-stone-100 pt-1.5 mt-auto">
                          <span>{item.prefecture}</span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Monetization / Side Contents */}
        <div className="flex flex-col gap-6">
          
          {/* Recommended Items */}
          <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Star className="text-secondary fill-secondary" size={18} />
                新着おすすめアイテム
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">先輩ママパパのリアルな愛用品</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentItems.length === 0 ? (
                <div className="text-center text-stone-400 text-xs py-4">
                  まだアイテムがありません。
                </div>
              ) : (
                recentItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <Link href={`/items/${item.id}`} className="absolute inset-0 z-10" aria-label={item.title}></Link>
                    <AffiliateProductCard 
                      title={item.title}
                      description={item.description}
                      imageUrl={item.image_url || "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
                      platform={item.platform as "Amazon" | "楽天" | "plyo.blog"}
                      url={item.affiliate_url || item.original_url}
                      rating={item.rating}
                    />
                  </div>
                ))
              )}
            </div>

            <Link 
              href="/items/new" 
              className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Heart size={14} className="text-primary" />
              おすすめアイテムを投稿する
            </Link>
          </section>

          {/* Games Section */}
          <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Gamepad2 className="text-accent" size={18} />
                子供とあそぶ知育ゲーム
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">スキマ時間に親子で楽しめるオリジナルゲーム</p>
            </div>

            <div className="flex flex-col gap-2">
              <Link 
                href="/games/aizukan" 
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg shrink-0">
                  📖
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-stone-800 group-hover:text-primary transition-colors">AI図鑑</h4>
                  <p className="text-[11px] text-stone-400 truncate">オリジナル図鑑をつくろう</p>
                </div>
              </Link>
              <Link 
                href="/games/battleship" 
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-lg shrink-0">
                  🚢
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-stone-800 group-hover:text-primary transition-colors">戦艦スタディRPG</h4>
                  <p className="text-[11px] text-stone-400 truncate">クイズで戦艦をパワーアップ</p>
                </div>
              </Link>
            </div>
            <Link href="/games" className="text-center pt-2 border-t border-stone-100 text-xs font-bold text-primary hover:underline">
              すべてのゲームを見る
            </Link>
          </section>

          {/* plyo.blog Link Banner Card */}
          <a 
            href="https://plyo.blog" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-stone-900 p-5 text-white hover-lift block shadow-xs"
          >
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold">
                <BookOpen size={14} />
                <span>plyo.blog</span>
              </div>
              <h3 className="font-bold text-sm text-stone-100 leading-snug">
                子育てのリアルな知見をもっと読む
              </h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                専門記事や育児ハックをブログでお届けしています。
              </p>
              <div className="flex items-center gap-1 font-bold text-xs text-primary group-hover:gap-1.5 transition-all mt-1">
                記事を読む <ArrowRight size={14} />
              </div>
            </div>
          </a>

        </div>
      </div>
    </div>
  );
}
