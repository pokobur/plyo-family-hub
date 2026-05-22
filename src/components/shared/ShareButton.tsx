'use client'

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function ShareButton({ 
  className = "flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors bg-gray-50 px-4 py-2 rounded-full hover-lift", 
  size = 16,
  showText = true
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Could not copy text: ", err);
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className={className}
        type="button"
      >
        {copied ? (
          <>
            <Check size={size} className="text-green-500 shrink-0" />
            {showText && <span className="text-green-500">コピー完了！</span>}
          </>
        ) : (
          <>
            <Share2 size={size} className="shrink-0" />
            {showText && <span>シェア</span>}
          </>
        )}
      </button>

      {copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50">
          クリップボードにコピーしました
        </div>
      )}
    </div>
  );
}
