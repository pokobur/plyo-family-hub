'use client'

import { ArrowLeft, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { createQuestion } from "@/app/actions/qa";

export default function NewQAPage() {
  const [state, formAction, isPending] = useActionState(createQuestion, { message: "", errors: {} });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-12">
      <Link href="/qa" className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors w-fit">
        <ArrowLeft size={15} /> 知恵袋一覧に戻る
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <div className="bg-primary-light text-primary p-2.5 rounded-xl shrink-0">
            <MessageCircle size={22} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">新しく質問する</h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">子育てのちょっとした悩み、先輩パパママに聞いてみましょう。</p>
          </div>
        </div>

        {/* Form area */}
        <form action={formAction} className="flex flex-col gap-5">
          
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-stone-700 text-xs">カテゴリ <span className="text-primary">*</span></label>
            <div className="flex flex-wrap gap-1.5">
              {['寝かしつけ', '離乳食・食事', 'イヤイヤ期', '知育・おもちゃ', '時短・家事', '保育園・幼稚園', 'その他'].map(cat => (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} className="peer sr-only" defaultChecked={cat === '寝かしつけ'} />
                  <div className="px-3.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-stone-100 transition-all">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
            {state?.errors?.category && <p className="text-red-500 text-xs font-bold mt-1">{state.errors.category[0]}</p>}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-stone-700 text-xs">質問のタイトル <span className="text-primary">*</span></label>
            <input 
              type="text" 
              name="title"
              placeholder="例: 2歳児のイヤイヤ期、みんなどう乗り切ってる？" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-primary focus:bg-white transition-all font-medium"
              required
            />
            {state?.errors?.title && <p className="text-red-500 text-xs font-bold mt-0.5">{state.errors.title[0]}</p>}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-stone-700 text-xs">質問の詳細 <span className="text-primary">*</span></label>
            <textarea 
              name="body"
              placeholder="具体的な状況や、試してみたこと、どんなアドバイスが欲しいかを書いてみましょう。" 
              rows={6}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-800 outline-none focus:border-primary focus:bg-white transition-all resize-y font-medium"
              required
            ></textarea>
            {state?.errors?.body && <p className="text-red-500 text-xs font-bold mt-0.5">{state.errors.body[0]}</p>}
            
            {/* Guidelines hint */}
            <div className="flex gap-2 p-3 bg-stone-50 rounded-xl mt-1 border border-stone-100">
              <Info size={15} className="text-stone-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-500 leading-relaxed">
                個人を特定できる情報（お名前、住所など）は含めないでください。お互いを尊重しあたたかい気持ちで交流しましょう。
              </p>
            </div>
          </div>

          {state?.message && <div className="text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-xs">{state.message}</div>}

          {/* Submit Action */}
          <div className="mt-2 pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Link href="/qa" className="text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors">
              キャンセル
            </Link>
            <button 
              disabled={isPending} 
              type="submit" 
              className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-2xs hover-lift disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm"
            >
              {isPending ? '投稿中...' : '質問を投稿する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
