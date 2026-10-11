import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, MessageCircle, Heart, Gift, ArrowRight, Clock, Plus, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/mypage");
  }

  // Fetch user's questions
  const { data: myQuestions } = await supabase
    .from("questions")
    .select("id, title, category, created_at, likes, answers(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's items
  const { data: myItems } = await supabase
    .from("items")
    .select("id, title, category, platform, rating, likes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's gifts
  const { data: myGifts } = await supabase
    .from("gift_items")
    .select("id, title, category, status, delivery_method, created_at, images")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's gift applications
  const { data: myApplications } = await supabase
    .from("gift_applications")
    .select("id, status, created_at, gift_item_id, gift_items(id, title, status)")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  const nickname = user.user_metadata?.nickname || user.email?.split("@")[0] || "ファミリーメンバー";

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-2xl border border-primary/20 shrink-0">
            {nickname[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{nickname}</h1>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">マイページ</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/gifts/new"
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> お譲りを投稿
          </Link>
          <Link
            href="/qa/new"
            className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus size={14} /> 質問を投稿
          </Link>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="flex flex-col gap-8">
        
        {/* Section 1: My Questions */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              投稿した子育ての悩み・質問 ({myQuestions?.length || 0})
            </h2>
            <Link href="/qa/new" className="text-xs font-bold text-primary hover:underline">
              新しく質問する
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {!myQuestions || myQuestions.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-stone-200 text-center text-xs text-stone-400">
                まだ投稿した質問はありません。
              </div>
            ) : (
              myQuestions.map((q: any) => (
                <Link
                  key={q.id}
                  href={`/qa/${q.id}`}
                  className="bg-white p-4 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all shadow-2xs flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                      {q.category}
                    </span>
                    <h3 className="font-bold text-sm text-stone-800 group-hover:text-primary transition-colors truncate mt-1">
                      {q.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 font-medium shrink-0">
                    <span>{q.answers?.[0]?.count || 0} 件の回答</span>
                    <ChevronRight size={14} className="text-stone-300" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Section 2: My Items */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Heart size={18} className="text-primary" />
              おすすめした神アイテム ({myItems?.length || 0})
            </h2>
            <Link href="/items/new" className="text-xs font-bold text-primary hover:underline">
              アイテムを追加
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {!myItems || myItems.length === 0 ? (
              <div className="sm:col-span-2 bg-white p-6 rounded-xl border border-stone-200 text-center text-xs text-stone-400">
                まだおすすめアイテムを投稿していません。
              </div>
            ) : (
              myItems.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="bg-white p-4 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all shadow-2xs flex flex-col justify-between gap-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-stone-500">{item.category}</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px]">{item.platform}</span>
                    </div>
                    <h3 className="font-bold text-xs text-stone-800 group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-50">
                    <span>参考になった: {item.likes || 0}</span>
                    <span>★ {item.rating}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Section 3: My Gifts & Applications */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Gift size={18} className="text-secondary" />
              おさがり・お譲りボードの履歴
            </h2>
            <Link href="/gifts/new" className="text-xs font-bold text-primary hover:underline">
              お譲り品を出品
            </Link>
          </div>

          {/* Sub: My Given items */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-stone-500">あなたが出品したお譲り品 ({myGifts?.length || 0})</h3>
            {!myGifts || myGifts.length === 0 ? (
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-center text-xs text-stone-400">
                出品履歴はありません。
              </div>
            ) : (
              myGifts.map((gift: any) => (
                <Link
                  key={gift.id}
                  href={`/gifts/${gift.id}`}
                  className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all shadow-2xs flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                      <img 
                        src={gift.images?.[0] || "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                        alt={gift.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-stone-800 truncate group-hover:text-primary transition-colors">
                        {gift.title}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {new Date(gift.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    gift.status === 'open' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : gift.status === 'matched' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-stone-100 text-stone-600'
                  }`}>
                    {gift.status === 'open' ? '受付中' : gift.status === 'matched' ? '交渉中' : '取引完了'}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Sub: My Applications */}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-xs font-bold text-stone-500">応募したお譲り品 ({myApplications?.length || 0})</h3>
            {!myApplications || myApplications.length === 0 ? (
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-center text-xs text-stone-400">
                応募履歴はありません。
              </div>
            ) : (
              myApplications.map((app: any) => (
                <Link
                  key={app.id}
                  href={`/gifts/${app.gift_item_id}`}
                  className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all shadow-2xs flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-stone-800 truncate group-hover:text-primary transition-colors">
                      {app.gift_items?.title || "お譲りアイテム"}
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      応募日時: {new Date(app.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    app.status === 'accepted' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {app.status === 'accepted' ? 'マッチング成立 🎉' : '応募中'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
