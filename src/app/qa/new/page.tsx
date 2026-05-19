'use client'

import { ArrowLeft, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { createQuestion } from "@/app/actions/qa";

export default function NewQAPage() {
  const [state, formAction, isPending] = useActionState(createQuestion, { message: "", errors: {} });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/qa" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> 知恵袋一覧に戻る
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
            <MessageCircle size={28} className="fill-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">新しく質問する</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">子育てのちょっとした悩み、先輩パパママに聞いてみましょう。</p>
          </div>
        </div>

        {/* Form area */}
        <form action={formAction} className="flex flex-col gap-6">
          
          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {['寝かしつけ', '離乳食・食事', 'イヤイヤ期', '知育・おもちゃ', '時短・家事', '保育園・幼稚園', 'その他'].map(cat => (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} className="peer sr-only" defaultChecked={cat === '寝かしつけ'} />
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-gray-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 peer-checked:border-blue-200 hover:bg-gray-100 transition-colors">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
            {state?.errors?.category && <p className="text-red-500 text-xs font-bold">{state.errors.category[0]}</p>}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm">質問のタイトル <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="title"
              placeholder="例: 2歳児のイヤイヤ期、みんなどう乗り切ってる？" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              required
            />
            {state?.errors?.title && <p className="text-red-500 text-xs font-bold">{state.errors.title[0]}</p>}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm flex items-center justify-between">
              <span>質問の詳細 <span className="text-red-500">*</span></span>
            </label>
            <textarea 
              name="body"
              placeholder="具体的な状況や、試してみたこと、どんなアドバイスが欲しいかを書いてみましょう。" 
              rows={8}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y font-medium"
              required
            ></textarea>
            {state?.errors?.body && <p className="text-red-500 text-xs font-bold">{state.errors.body[0]}</p>}
            
            {/* Guidelines hint */}
            <div className="flex gap-2 p-3 bg-blue-50 rounded-xl mt-1 border border-blue-100">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                個人を特定できる情報（名前、住所など）は含めないでください。温かいコミュニティを保つため、誹謗中傷はお控えください。
              </p>
            </div>
          </div>

          {state?.message && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{state.message}</div>}

          {/* Submit Action */}
          <div className="mt-4 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link href="/qa" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              キャンセル
            </Link>
            <button disabled={isPending} type="submit" className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? '投稿中...' : '投稿する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
