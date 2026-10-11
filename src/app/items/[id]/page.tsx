/* eslint-disable @next/next/no-img-element */
import { Star, ExternalLink, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/shared/ShareButton";
import LikeButton from "@/components/shared/LikeButton";
import { getItem } from "@/app/actions/items";
import { checkUserLiked } from "@/app/actions/likes";
import { notFound } from "next/navigation";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const itemData = await getItem(resolvedParams.id);

  if (!itemData) {
    notFound();
  }

  const isLiked = await checkUserLiked(itemData.id, 'item');

  const platformButtonStyles: Record<string, string> = {
    Amazon: "bg-[#e89138] hover:bg-[#d07b27] text-white shadow-xs",
    "楽天": "bg-[#bf3b3b] hover:bg-[#a82e2e] text-white shadow-xs",
    "plyo.blog": "bg-stone-800 hover:bg-stone-900 text-white shadow-xs",
    "その他": "bg-stone-800 hover:bg-stone-900 text-white shadow-xs",
  };

  const date = new Date(itemData.created_at);
  const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  const btnStyle = platformButtonStyles[itemData.platform] || platformButtonStyles["その他"];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      <Link 
        href="/items" 
        className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors w-fit"
      >
        <ArrowLeft size={15} /> おすすめアイテム一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 h-64 md:h-auto bg-stone-50 relative p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-200">
            <img 
              src={itemData.image_url || "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={itemData.title} 
              className="max-h-60 max-w-full object-contain rounded-xl drop-shadow-sm"
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold bg-white text-stone-700 px-3 py-1 rounded-full shadow-2xs border border-stone-200">
                {itemData.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-secondary mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < Math.floor(itemData.rating) ? "fill-secondary text-secondary" : "text-stone-200"} 
                    />
                  ))}
                </div>
                <span className="text-xs text-stone-500 font-bold ml-1">おすすめ度: {itemData.rating}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug mb-4">
                {itemData.title}
              </h1>

              <div className="flex items-center gap-2.5 mb-6 py-2 border-y border-stone-100">
                <div className="w-8 h-8 bg-stone-100 text-stone-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {itemData.author?.[0] || "パ"}
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 font-medium">おすすめした人</div>
                  <div className="font-bold text-xs text-stone-700">{itemData.author} <span className="font-normal text-stone-400 ml-2">{formattedDate}</span></div>
                </div>
              </div>

              <div className="text-stone-700 leading-relaxed text-sm whitespace-pre-wrap mb-8">
                {itemData.description}
              </div>
            </div>

            {/* Affiliate CTA */}
            <div className="flex flex-col gap-2 pt-4 border-t border-stone-100">
              <a 
                href={itemData.affiliate_url || itemData.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all flex justify-center items-center gap-2 cursor-pointer ${btnStyle}`}
              >
                {itemData.platform === "その他" ? "商品ページを見る" : `${itemData.platform} で詳細を見る`} 
                <ExternalLink size={16} />
              </a>
              <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> アフィリエイトリンクを利用しています
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement actions */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <LikeButton
            targetId={itemData.id}
            type="item"
            initialLikes={itemData.likes || 0}
            initialIsLiked={isLiked}
            label="参考になった"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm"
            size={17}
          />
          <ShareButton 
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 shadow-2xs px-4 py-2 rounded-xl cursor-pointer" 
            size={16} 
          />
        </div>
      </div>

    </div>
  );
}
