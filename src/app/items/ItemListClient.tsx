'use client'

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import AffiliateProductCard from "@/components/shared/AffiliateProductCard";
import { ITEM_CATEGORIES, FALLBACK_IMAGES } from "@/lib/constants";
import type { RecommendedItem } from "@/types";

interface ItemListClientProps {
  initialItems: RecommendedItem[];
}

const CATEGORIES = ["すべて", ...ITEM_CATEGORIES];

export default function ItemListClient({ initialItems }: ItemListClientProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "Amazon" | "楽天">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "likes" | "rating">("newest");

  const filteredItems = initialItems
    .filter((item) => {
      // Category filter
      if (selectedCategory !== "すべて" && item.category !== selectedCategory) {
        return false;
      }
      // Platform filter
      if (selectedPlatform !== "all" && item.platform !== selectedPlatform) {
        return false;
      }
      // Search keyword
      if (searchKeyword.trim()) {
        const lowerKeyword = searchKeyword.toLowerCase();
        const titleMatch = (item.title || "").toLowerCase().includes(lowerKeyword);
        const descMatch = (item.description || "").toLowerCase().includes(lowerKeyword);
        return titleMatch || descMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "likes") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortOrder === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col gap-4">
        {/* Keyword Search */}
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="アイテム名やおすすめ理由で検索（例: 抱っこ紐、チェア、ストロー）..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
          />
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter sub-row: Shop and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          {/* Platform Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                selectedPlatform === "all"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              全ショップ
            </button>
            <button
              onClick={() => setSelectedPlatform("Amazon")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                selectedPlatform === "Amazon"
                  ? "bg-white text-amber-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Amazon
            </button>
            <button
              onClick={() => setSelectedPlatform("楽天")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                selectedPlatform === "楽天"
                  ? "bg-white text-rose-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              楽天
            </button>
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
            <button
              onClick={() => setSortOrder("newest")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                sortOrder === "newest"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              新着順
            </button>
            <button
              onClick={() => setSortOrder("likes")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                sortOrder === "likes"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              参考になった順
            </button>
            <button
              onClick={() => setSortOrder("rating")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                sortOrder === "rating"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              評価順
            </button>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="sm:col-span-2 text-center py-14 bg-white rounded-2xl border border-stone-200 text-stone-500 flex flex-col items-center gap-2">
            <p className="font-bold text-sm text-stone-700">該当するアイテムが見つかりませんでした。</p>
            <p className="text-xs text-stone-400">キーワードやカテゴリの絞り込みを変更してみてください。</p>
            {(searchKeyword || selectedCategory !== "すべて" || selectedPlatform !== "all") && (
              <button
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedCategory("すべて");
                  setSelectedPlatform("all");
                }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                絞り込み条件をリセットする
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link href={`/items/${item.id}`} className="absolute inset-0 z-10" aria-label={item.title}></Link>
              <AffiliateProductCard
                title={item.title}
                description={item.description}
                imageUrl={item.image_url || FALLBACK_IMAGES.ITEM}
                platform={item.platform as "Amazon" | "楽天" | "plyo.blog"}
                url={item.affiliate_url || item.original_url}
                rating={item.rating}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
