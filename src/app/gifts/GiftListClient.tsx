'use client'

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Tag, Award, Check } from "lucide-react";

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
  const [selectedStatus, setSelectedStatus] = useState("all"); // 'all', 'open', 'matched', 'completed'

  // Extract unique prefectures from items for the dropdown filter
  const uniquePrefectures = Array.from(
    new Set(initialItems.map(item => item.prefecture).filter(Boolean))
  ).sort();

  // Dynamic filter
  const filteredItems = initialItems.filter(item => {
    const matchSearch = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

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
      <div className="glass-panel p-6 rounded-3xl border border-primary/20 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="キーワードで探す（おもちゃ、子供服など）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-800"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Location Dropdown */}
          <div className="relative w-full md:w-48">
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">都道府県 (すべて)</option>
              {uniquePrefectures.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Condition Dropdown */}
          <div className="relative w-full md:w-56">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">商品の状態 (すべて)</option>
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
            <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Category Badges */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-500">カテゴリで絞り込み:</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === ""
                  ? "bg-primary text-white shadow-xs"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              すべて
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-xs"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-t border-gray-100 pt-4 gap-2">
          {[
            { id: 'all', label: 'すべてのアイテム' },
            { id: 'open', label: '受付中' },
            { id: 'matched', label: '交渉中' },
            { id: 'completed', label: 'お譲り完了' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-primary/10 text-primary-dark border border-primary/20"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const firstImage = item.images && item.images.length > 0
              ? item.images[0]
              : "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

            return (
              <Link
                key={item.id}
                href={`/gifts/${item.id}`}
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md hover-lift transition-all overflow-hidden"
              >
                {/* Photo with Overlay Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-50 border-b border-gray-100 shrink-0">
                  <img
                    src={firstImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {item.status === 'open' && (
                      <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        受付中
                      </span>
                    )}
                    {item.status === 'matched' && (
                      <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        交渉中
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="bg-gray-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        お譲り完了
                      </span>
                    )}
                  </div>

                  {/* Delivery Method Overlay */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border shadow-xs ${
                      item.delivery_method === '手渡し'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : item.delivery_method === '郵送'
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-purple-500 text-white border-purple-600'
                    }`}>
                      {item.delivery_method === '両方' ? '手渡し/郵送' : item.delivery_method}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-primary/10 text-primary-dark font-black px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {item.condition}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-2 mt-auto">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      {item.prefecture} {item.city}
                    </span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
          <p className="text-sm text-gray-400 font-bold">該当するお譲りアイテムが見つかりませんでした。</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedCondition("");
              setSelectedPrefecture("");
              setSelectedStatus("all");
            }}
            className="mt-4 text-xs text-primary hover:text-primary-dark font-black underline cursor-pointer"
          >
            すべての条件をリセットする
          </button>
        </div>
      )}
    </div>
  );
}
