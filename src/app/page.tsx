import Link from "next/link";
import { ArrowRight, ChevronRight, Gamepad2, Star, MessageCircle, Heart } from "lucide-react";
import { getQuestions } from "@/app/actions/qa";
import { getItems } from "@/app/actions/items";
import AffiliateProductCard from "@/components/shared/AffiliateProductCard";

export default async function Home() {
  const allQuestions = await getQuestions();
  const allItems = await getItems();

  const recentQuestions = allQuestions.slice(0, 4);
  const recentItems = allItems.slice(0, 2);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#ff9a8b] p-10 md:p-16 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            子育ての悩みを共有し、<br />
            毎日を少しだけ楽にする。
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 mb-8 leading-relaxed">
            リアルな悩みを相談できる知恵袋と、先輩パパママが選んだ「本当におすすめのアイテム」が集まる子育て支援ポータル。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/qa" 
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <MessageCircle size={24} />
              悩みを相談する
            </Link>
            <Link 
              href="/items" 
              className="bg-primary-dark/30 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-dark/50 transition-colors flex items-center gap-2"
            >
              <Star size={24} />
              おすすめアイテムを見る
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-64 h-64 bg-secondary/30 blur-2xl rounded-full pointer-events-none"></div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: UGC Content */}
        <div className="md:col-span-2 flex flex-col gap-10">
          
          {/* Q&A Section (UGC) */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <MessageCircle className="text-blue-400" />
                  新着の知恵袋
                </h2>
                <p className="text-gray-500 text-sm mt-1">みんなのリアルな悩みと解決策</p>
              </div>
              <Link href="/qa" className="text-sm font-bold text-primary flex items-center hover:underline">
                もっと見る <ChevronRight size={16} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentQuestions.length === 0 ? (
                <div className="glass-panel p-5 rounded-2xl text-center text-gray-500 font-medium border border-gray-100">
                  まだ質問がありません。
                </div>
              ) : (
                recentQuestions.map((item) => (
                  <Link key={item.id} href={`/qa/${item.id}`} className="glass-panel p-5 rounded-2xl hover-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">{item.category}</span>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1"><MessageCircle size={14} /> {item.answers?.[0]?.count || 0} 回答</span>
                      <span>{item.views || 0} views</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Monetization / Affiliate Focus */}
        <div className="flex flex-col gap-6">
          
          {/* Recommended Items (Affiliate Generator) */}
          <section className="bg-gradient-to-b from-[#fff8e1] to-white p-6 rounded-[2rem] border border-[#ffe082] shadow-sm">
            <h2 className="text-xl font-black mb-1 flex items-center gap-2">
              <Star className="text-secondary fill-secondary" />
              新着おすすめアイテム
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-5">先輩ママパパのリアルなレビュー</p>
            
            <div className="flex flex-col gap-4">
              {recentItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm font-medium py-4">
                  まだアイテムがありません。
                </div>
              ) : (
                recentItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <Link href={`/items/${item.id}`} className="absolute inset-0 z-10"></Link>
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

            <Link href="/items/new" className="w-full mt-5 py-3 border-2 border-dashed border-[#ffe082] text-yellow-600 rounded-xl font-bold text-sm hover:bg-[#fffdf7] transition-colors flex items-center justify-center gap-2">
              <Heart size={16} />
              おすすめアイテムを投稿する
            </Link>
          </section>

          {/* Games Section */}
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black mb-1 flex items-center gap-2 text-gray-800">
              <Gamepad2 className="text-primary" size={20} />
              息抜きコンテンツ
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-4">子供が夢中になる知育ゲーム</p>
            <div className="flex flex-col gap-3">
              <Link href="/games/aizukan" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <div className="text-2xl group-hover:scale-110 transition-transform origin-left">📖</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">AI図鑑</h4>
                  <p className="text-[11px] text-gray-500">オリジナル図鑑を作ろう</p>
                </div>
              </Link>
              <Link href="/games/battleship" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <div className="text-2xl group-hover:scale-110 transition-transform origin-left">🚢</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">戦艦スタディRPG</h4>
                  <p className="text-[11px] text-gray-500">勉強して船を強くしよう</p>
                </div>
              </Link>
            </div>
            <Link href="/games" className="block text-center mt-3 text-xs font-bold text-primary hover:underline">
              すべてのゲームを見る
            </Link>
          </section>

          {/* plyo.blog Link Context Banner */}
          <a 
            href="https://plyo.blog" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-[2rem] bg-indigo-600 p-6 text-white hover-lift block mt-4"
          >
            <div className="relative z-10">
              <h3 className="font-black text-lg mb-2">もっと詳しく知りたい？</h3>
              <p className="text-indigo-100 text-sm font-medium mb-4">plyo.blogで、子育ての悩みを解決する専門的な記事を読んでみましょう。</p>
              <div className="flex items-center gap-1 font-bold text-sm text-white group-hover:gap-2 transition-all">
                記事一覧へ <ArrowRight size={16} />
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 group-hover:scale-110 transition-transform duration-500">
              📚
            </div>
          </a>

        </div>
      </div>
    </div>
  );
}
