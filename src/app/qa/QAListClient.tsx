'use client'

import { useState } from "react";
import Link from "next/link";
import { Search, Heart, MessageSquare, X } from "lucide-react";
import { QA_CATEGORIES } from "@/lib/constants";
import type { Question } from "@/types";

interface QAListClientProps {
  initialQuestions: Question[];
}

const CATEGORIES = ["すべて", ...QA_CATEGORIES];

export default function QAListClient({ initialQuestions }: QAListClientProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [sortOrder, setSortOrder] = useState<"newest" | "answers" | "likes">("newest");

  // Filter and Sort logic
  const filteredQuestions = initialQuestions
    .filter((q) => {
      // Category filter
      if (selectedCategory !== "すべて" && q.category !== selectedCategory) {
        return false;
      }
      // Keyword search
      if (searchKeyword.trim()) {
        const lowerKeyword = searchKeyword.toLowerCase();
        const titleMatch = (q.title || "").toLowerCase().includes(lowerKeyword);
        const bodyMatch = (q.body || "").toLowerCase().includes(lowerKeyword);
        return titleMatch || bodyMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "answers") {
        const countA = a.answers?.[0]?.count || 0;
        const countB = b.answers?.[0]?.count || 0;
        return countB - countA;
      }
      if (sortOrder === "likes") {
        return (b.likes || 0) - (a.likes || 0);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col gap-4">
        {/* Keyword Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="キーワードで知恵袋を検索（例: 離乳食、夜泣き、2歳）..."
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

        {/* Sort Options */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-medium">
            該当件数: <strong className="text-stone-700 font-bold">{filteredQuestions.length}</strong> 件
          </span>

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
              onClick={() => setSortOrder("answers")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                sortOrder === "answers"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              回答が多い順
            </button>
            <button
              onClick={() => setSortOrder("likes")}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                sortOrder === "likes"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              いいね順
            </button>
          </div>
        </div>
      </div>

      {/* Q&A List */}
      <div className="flex flex-col gap-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-stone-200 text-stone-500 flex flex-col items-center gap-2">
            <p className="font-bold text-sm text-stone-700">条件に一致する質問が見つかりませんでした。</p>
            <p className="text-xs text-stone-400">キーワードを変えるか、カテゴリの絞り込みを解除してみてください。</p>
            {(searchKeyword || selectedCategory !== "すべて") && (
              <button
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedCategory("すべて");
                }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                検索条件をリセットする
              </button>
            )}
          </div>
        ) : (
          filteredQuestions.map((item) => {
            const date = new Date(item.created_at);
            const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
            const answerCount = item.answers?.[0]?.count || 0;

            return (
              <Link
                key={item.id}
                href={`/qa/${item.id}`}
                className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-primary/40 hover-lift transition-all shadow-2xs group flex flex-col gap-3"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-md text-[11px]">
                    {item.category}
                  </span>
                  <span className="text-stone-400 font-medium text-[11px]">{formattedDate}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-800 mb-1.5 group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {item.author?.[0] || "パ"}
                    </div>
                    <span className="text-stone-500 font-medium text-[11px]">{item.author}</span>
                  </div>

                  <div className="flex items-center gap-3 font-semibold text-stone-400 text-xs">
                    <span className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart size={13} className="text-primary" /> {item.likes || 0}
                    </span>
                    <span className={`flex items-center gap-1 ${answerCount > 0 ? "text-stone-700 font-bold" : "text-stone-400"}`}>
                      <MessageSquare size={13} /> {answerCount} 件の回答
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
