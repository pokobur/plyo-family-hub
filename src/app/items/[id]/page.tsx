import { Star, ExternalLink, Heart, MessageSquare, ArrowLeft, ShieldCheck, Share2 } from "lucide-react";
import Link from "next/link";
import AffiliateProductCard from "@/components/shared/AffiliateProductCard";
import { getItem } from "@/app/actions/items";
import { notFound } from "next/navigation";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const itemData = await getItem(resolvedParams.id);

  if (!itemData) {
    notFound();
  }

  const platformStyles = {
    Amazon: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30",
    "楽天": "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30",
    "plyo.blog": "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30",
    "その他": "bg-gray-500 hover:bg-gray-600 text-white shadow-gray-500/30",
  };

  const date = new Date(itemData.created_at);
  const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  const platformKey = itemData.platform in platformStyles ? itemData.platform : 'その他';

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <Link href="/items" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> おすすめアイテム一覧に戻る
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 h-64 md:h-auto bg-gray-50 relative p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <img 
              src={itemData.image_url || "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={itemData.title} 
              className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 rounded-lg"
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold bg-white text-gray-700 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {itemData.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(itemData.rating) ? "fill-secondary" : "fill-transparent"} />
                ))}
                <span className="text-sm text-gray-500 font-bold ml-2">{itemData.rating}</span>
              </div>
            </div>

            <h1 className="text-2xl font-black text-gray-800 leading-tight mb-6">
              {itemData.title}
            </h1>

            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5 font-medium">おすすめした人</div>
                <div className="font-bold text-gray-700 text-sm">{itemData.author} <span className="font-normal text-gray-400 ml-2">{formattedDate}</span></div>
              </div>
            </div>

            <div className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap flex-1 mb-8">
              {itemData.description}
            </div>

            {/* Affiliate CTA */}
            <div className="mt-auto flex flex-col gap-3">
              <a 
                href={itemData.affiliate_url || itemData.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-xl font-black text-center shadow-lg hover-lift transition-all flex justify-center items-center gap-2 ${platformStyles[platformKey as keyof typeof platformStyles]}`}
              >
                {itemData.platform} で詳細を見る <ExternalLink size={18} />
              </a>
              <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> アフィリエイトリンクを利用しています
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors bg-white border border-gray-100 shadow-sm px-6 py-3 rounded-full hover-lift">
            <Heart size={18} className="text-gray-400" /> 参考になった ({itemData.likes})
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors bg-white border border-gray-100 shadow-sm px-6 py-3 rounded-full hover-lift">
            <Share2 size={18} className="text-gray-400" /> シェア
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
          <MessageSquare size={18} /> 0 件のコメント
        </div>
      </div>

    </div>
  );
}
