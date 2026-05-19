import { ExternalLink, Star } from "lucide-react";

interface AffiliateProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  platform: "Amazon" | "楽天" | "plyo.blog";
  url: string;
  rating?: number;
}

export default function AffiliateProductCard({ title, description, imageUrl, platform, url, rating = 5 }: AffiliateProductCardProps) {
  // Determine styling based on platform
  const platformStyles = {
    Amazon: "bg-orange-100 text-orange-700 border-orange-200",
    "楽天": "bg-red-100 text-red-700 border-red-200",
    "plyo.blog": "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary hover-lift transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        
        {/* Content */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h4 className="font-bold text-gray-800 leading-tight mb-1.5 group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            {/* Rating Stars */}
            <div className="flex gap-0.5 text-secondary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(rating) ? "fill-secondary" : "fill-transparent"} />
              ))}
              <span className="text-xs text-gray-400 font-medium ml-1">({rating})</span>
            </div>
            
            {/* Affiliate Tag */}
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${platformStyles[platform]}`}>
              {platform}で見る <ExternalLink size={10} />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
