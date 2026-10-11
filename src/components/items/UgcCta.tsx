'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Link2 } from "lucide-react";

export default function UgcCta() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearchAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/items/new?q=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/items/new");
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#fbf8f5] to-[#f5ede5] p-6 sm:p-8 rounded-2xl border border-stone-200/90 text-center relative overflow-hidden shadow-2xs">
      <form onSubmit={handleSearchAndAdd} className="relative z-10 max-w-xl mx-auto flex flex-col gap-3">
        <div>
          <span className="inline-block text-[11px] font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full mb-2">
            簡単おすすめ投稿
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
            あなたの「買ってよかった神アイテム」を教えてください！
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            Amazonや楽天の商品URLを貼り付けるだけで、商品名・画像を自動取得してレビューを作成できます。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <input 
              type="url" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="商品URLを貼り付け（https://...）" 
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium"
            />
            <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
          <button 
            type="submit" 
            className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs hover-lift whitespace-nowrap cursor-pointer text-xs sm:text-sm"
          >
            <Plus size={16} /> アイテムを投稿する
          </button>
        </div>
      </form>
    </section>
  );
}
