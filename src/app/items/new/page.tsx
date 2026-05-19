'use client'

import { ArrowLeft, Heart, Link as LinkIcon, Info, Star } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createItem } from "@/app/actions/items";

export default function NewItemPage() {
  const [state, formAction, isPending] = useActionState(createItem, { message: "", errors: {} });
  const [rating, setRating] = useState(5);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/items" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> アイテム一覧に戻る
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl">
            <Heart size={28} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">おすすめアイテムを共有する</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">「買ってよかった！」と思う神アイテムをパパママ仲間にシェアしましょう。</p>
          </div>
        </div>

        {/* Form area */}
        <form action={formAction} className="flex flex-col gap-8">
          
          {/* Step 1: URL Input */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">1</span>
              <label className="font-bold text-gray-800">商品のURLを貼り付け</label>
            </div>
            
            <div className="relative">
              <input 
                type="url" 
                name="original_url"
                placeholder="Amazon または 楽天 の商品URL" 
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                required
              />
              <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {state?.errors?.original_url && <p className="text-red-500 text-xs font-bold">{state.errors.original_url[0]}</p>}
            
            <div className="flex gap-2">
              <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded border border-orange-200">Amazon対応</span>
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200">楽天対応</span>
            </div>
            
            <p className="text-xs text-gray-500 font-medium">
              URLを貼り付けると、商品名や画像が自動的に取得されます。（※現在モックアップのため自動取得されません）
            </p>
          </div>

          {/* Step 2: Review Content */}
          <div className="flex flex-col gap-5 pl-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">2</span>
              <label className="font-bold text-gray-800">レビューを書く</label>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">カテゴリ <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['知育・おもちゃ', '時短・家事', '寝かしつけ', 'お出かけ', '離乳食・食事', 'マタニティ', 'その他'].map(cat => (
                  <label key={cat} className="cursor-pointer">
                    <input type="radio" name="category" value={cat} className="peer sr-only" defaultChecked={cat === '知育・おもちゃ'} />
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-gray-500 peer-checked:bg-primary/10 peer-checked:text-primary-dark peer-checked:border-primary/30 hover:bg-gray-100 transition-colors">
                      {cat}
                    </div>
                  </label>
                ))}
              </div>
              {state?.errors?.category && <p className="text-red-500 text-xs font-bold">{state.errors.category[0]}</p>}
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">おすすめ度 <span className="text-red-500">*</span></label>
              <input type="hidden" name="rating" value={rating} />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    type="button" 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`transition-colors ${star <= rating ? 'text-secondary' : 'text-gray-300 hover:text-secondary/50'}`}
                  >
                    <Star size={32} className={star <= rating ? 'fill-secondary' : ''} />
                  </button>
                ))}
              </div>
              {state?.errors?.rating && <p className="text-red-500 text-xs font-bold">{state.errors.rating[0]}</p>}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">
                おすすめの理由 <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description"
                placeholder="どんな悩みが解決したか、どのようなシーンで役立っているかなど、具体的に教えてください。" 
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y font-medium"
                required
              ></textarea>
              {state?.errors?.description && <p className="text-red-500 text-xs font-bold">{state.errors.description[0]}</p>}
            </div>
            
            {/* Guidelines hint */}
            <div className="flex gap-2 p-3 bg-amber-50 rounded-xl mt-1 border border-amber-100">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                ご自身が実際に購入し、使用したアイテムのみご投稿ください。アフィリエイトリンクはシステム側で自動的に生成・付与されます。
              </p>
            </div>
          </div>

          {state?.message && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{state.message}</div>}

          {/* Submit Action */}
          <div className="mt-4 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link href="/items" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              キャンセル
            </Link>
            <button disabled={isPending} type="submit" className="bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? '投稿中...' : 'アイテムを投稿する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
