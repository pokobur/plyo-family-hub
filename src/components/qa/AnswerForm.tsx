'use client'

import { useActionState, useEffect, useRef } from "react";
import { createAnswer } from "@/app/actions/qa";
import { Info } from "lucide-react";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createAnswer, { message: "", errors: {}, success: false });

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs relative overflow-hidden">
      <div className="mb-5">
        <h3 className="font-bold text-stone-900 text-base">回答を投稿する</h3>
        <p className="text-xs text-stone-500 font-medium mt-1">あなたの経験やアドバイスが、他のパパママの助けになります。</p>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="question_id" value={questionId} />
        
        <div className="flex flex-col gap-1.5">
          <textarea
            name="body"
            placeholder="アドバイスや温かいメッセージを入力してください。"
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-stone-800 outline-none focus:border-primary focus:bg-white transition-all resize-y font-medium text-sm"
            required
            disabled={isPending}
          ></textarea>
          {state?.errors?.body && <p className="text-red-600 text-xs font-bold">{state.errors.body[0]}</p>}
        </div>

        {state?.message && (
          <div className={`p-3.5 rounded-xl text-xs font-bold border ${state.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {state.message}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="flex gap-1.5 text-xs text-stone-400 font-medium items-center">
            <Info size={14} className="text-stone-400 shrink-0" />
            <span>回答は誰でも見ることができます。</span>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all shadow-2xs hover-lift disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-xs sm:text-sm cursor-pointer"
          >
            {isPending ? '投稿中...' : '回答を投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
