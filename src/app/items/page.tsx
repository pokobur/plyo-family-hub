import AffiliateProductCard from "@/components/shared/AffiliateProductCard";
import UgcCta from "@/components/items/UgcCta";
import { Search, Heart } from "lucide-react";
import Link from "next/link";
import { getItems } from "@/app/actions/items";

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      
      {/* Header Area */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-black mb-4 flex items-center justify-center gap-2">
          <Heart className="text-primary fill-primary" />
          おすすめアイテム
        </h1>
        <p className="text-gray-600 font-medium">
          先輩パパママが「本当に買ってよかった！」と絶賛する、子育てQOL向上アイテム。<br/>
          あなたのおすすめもシェアしてみませんか？
        </p>
      </div>

      {/* UGC Submission CTA */}
      <UgcCta />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar px-2">
          <button className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">すべて</button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors">時短・家事</button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors">知育・おもちゃ</button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors">寝かしつけ</button>
        </div>
        <div className="relative w-full sm:w-64 pr-2">
          <input type="text" placeholder="キーワードで探す" className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-primary" />
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Item List */}
      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="md:col-span-2 text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-bold">
            まだアイテムがありません。最初のおすすめを投稿してみましょう！
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative group">
              <Link href={`/items/${item.id}`} className="absolute inset-0 z-10"></Link>
              <AffiliateProductCard 
                title={item.title}
                description={item.description}
                imageUrl={item.image_url || "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}
                platform={item.platform as "Amazon" | "楽天" | "plyo.blog"}
                url={item.affiliate_url || item.original_url}
                rating={item.rating}
              />
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="bg-white border border-gray-200 text-gray-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
            さらに読み込む
          </button>
        </div>
      )}

    </div>
  );
}
