'use client'

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Award, X } from "lucide-react";

interface GiftListClientProps {
  initialItems: any[];
}

const CATEGORIES = ['衣類', 'おもちゃ', 'ベビーカー・バギー', 'ベビーベッド・寝具', '抱っこひも・おんぶ紐', 'お食事用品', 'その他'];
const CONDITIONS = ['新品同様', '目立った傷や汚れなし', 'やや傷や汚れあり', '使用感あり'];

export default function GiftListClient({ initialItems }: GiftListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const uniquePrefectures = Array.from(
    new Set(initialItems.map(item => item.prefecture).filter(Boolean))
  ).sort();

  const filteredItems = initialItems.filter(item => {
    const matchSearch = searchQuery.trim() === '' || 
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchPrefecture = selectedPrefecture === '' || item.prefecture === selectedPrefecture;
    const matchCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchCondition = selectedCondition === '' || item.condition === selectedCondition;
    
    let matchStatus = true;
    if (selectedStatus !== 'all') {
      matchStatus = item.status === selectedStatus;
    }

    return matchSearch && matchPrefecture && matchCategory && matchCondition && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="キーワードで探す（おもちゃ、子供服など）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-stone-800 outline-none focus:border-primary focus:bg-white transition-all font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location Dropdown */}
          <div className="relative w-full md:w-44">
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-700 outline-none focus:border-primary focus:bg-white transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="">都道府県 (すべて)</option>
              {uniquePrefectures.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {/* Condition Dropdown */}
          <div className="relative w-full md:w-48">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-700 outline-none focus:border-primary focus:bg-white transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="">商品の状態 (すべて)</option>
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
            <Award size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === ""
                ? "bg-primary text-white shadow-2xs"
                : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            すべて
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-medium">
            該当件数: <strong className="text-stone-700 font-bold">{filteredItems.length}</strong> 件
          </span>

          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
            {[
              { id: 'all', label: 'すべて' },
              { id: 'open', label: '受付中' },
              { id: 'matched', label: '交渉中' },
              { id: 'completed', label: 'お譲り完了' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const firstImage = item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

            return (
              <Link
                key={item.id}
                href={`/gifts/${item.id}`}
                className="group flex flex-col bg-white rounded-xl border border-stone-200 hover:border-primary/40 hover-lift transition-all overflow-hidden shadow-2xs"
              >
                {/* Photo with Overlay Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-stone-50 border-b border-stone-100 shrink-0">
                  <img
                    src={firstImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {item.status === 'open' && (
                      <span className="bg-emerald-700/85 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        受付中
                      </span>
                    )}
                    {item.status === 'matched' && (
                      <span className="bg-sky-800/85 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        交渉中
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="bg-stone-800/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        お譲り完了
                      </span>
                    )}
                  </div>

                  {/* Delivery Method Overlay */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-stone-900/80 text-white backdrop-blur-xs">
                      {item.delivery_method === '両方' ? '手渡し / 郵送' : item.delivery_method}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1 gap-1.5 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {item.condition}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-stone-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium border-t border-stone-50 pt-1.5 mt-auto">
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin size={11} className="shrink-0 text-stone-400" />
                      {item.prefecture} {item.city}
                    </span>
                    <span className="shrink-0">
                      {new Date(item.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 text-stone-500">
          <p className="text-xs sm:text-sm font-bold text-stone-700">該当するお譲りアイテムが見つかりませんでした。</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedCondition("");
              setSelectedPrefecture("");
              setSelectedStatus("all");
            }}
            className="mt-3 text-xs text-primary hover:underline font-bold cursor-pointer"
          >
            すべての条件をリセットする
          </button>
        </div>
      )}
    </div>
  );
}
