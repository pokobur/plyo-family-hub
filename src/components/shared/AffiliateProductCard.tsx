/* eslint-disable @next/next/no-img-element */
import { ExternalLink, Star } from "lucide-react";

interface AffiliateProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  platform: "Amazon" | "楽天" | "plyo.blog" | "その他" | string;
  url: string;
  rating?: number;
}

export default function AffiliateProductCard({ title, description, imageUrl, platform, url, rating = 5 }: AffiliateProductCardProps) {
  const platformStyles: Record<string, string> = {
    Amazon: "bg-amber-50 text-amber-800 border-amber-200/80",
    "楽天": "bg-rose-50 text-rose-800 border-rose-200/80",
    "plyo.blog": "bg-stone-100 text-stone-800 border-stone-200",
    "その他": "bg-stone-50 text-stone-700 border-stone-200",
  };

  const currentStyle = platformStyles[platform] || platformStyles["その他"];

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-white p-3.5 rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all cursor-pointer group shadow-2xs"
    >
      <div className="flex gap-3.5">
        {/* Product Image */}
        <div className="w-20 h-20 bg-stone-50 rounded-lg overflow-hidden shrink-0 border border-stone-100 relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        
        {/* Content */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h4 className="font-bold text-xs text-stone-800 leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">{title}</h4>
            <p className="text-[11px] text-stone-500 line-clamp-1 leading-relaxed">{description}</p>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-50">
            {/* Rating Stars */}
            <div className="flex items-center gap-0.5 text-secondary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < Math.floor(rating) ? "fill-secondary text-secondary" : "text-stone-300"} />
              ))}
              <span className="text-[10px] text-stone-400 font-bold ml-1">{rating}</span>
            </div>
            
            {/* Affiliate Tag */}
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${currentStyle}`}>
              <span>{platform === "その他" ? "詳細" : platform}</span>
              <ExternalLink size={9} />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
