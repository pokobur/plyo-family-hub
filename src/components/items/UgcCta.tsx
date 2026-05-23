'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Heart } from "lucide-react";

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
    <section className="glass-panel p-8 rounded-3xl border-2 border-primary/20 text-center relative overflow-hidden">
      <form onSubmit={handleSearchAndAdd} className="relative z-10">
        <h2 className="text-xl font-bold mb-2">あなたの「おすすめアイテム」を教えてください！</h2>
        <p className="text-sm text-gray-500 mb-6">アイテムを検索して選ぶだけで、商品情報が自動でセットされます。</p>
        <div className="flex max-w-lg mx-auto gap-2">
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="商品名やキーワードで検索して追加..." 
            className="flex-1 bg-white border border-gray-200 rounded-full px-6 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
          />
          <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors flex items-center gap-1 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer text-sm">
            <Plus size={18} /> 追加する
          </button>
        </div>
      </form>
      <div className="absolute -top-10 -right-10 text-primary opacity-10">
        <Heart size={150} className="fill-primary" />
      </div>
    </section>
  );
}
