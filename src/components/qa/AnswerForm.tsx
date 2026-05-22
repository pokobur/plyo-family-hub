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
    <div className="mt-8 bg-blue-50/50 p-6 md:p-8 rounded-[2rem] border border-blue-100/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
      
      <div className="mb-6 pl-2">
        <h3 className="font-bold text-gray-800 text-lg">回答を投稿する</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">あなたの経験やアドバイスが、他のパパママの助けになります。</p>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4 pl-2">
        <input type="hidden" name="question_id" value={questionId} />
        
        <div className="flex flex-col gap-2">
          <textarea
            name="body"
            placeholder="アドバイスや温かいメッセージを入力してください。"
            rows={5}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y font-medium text-sm"
            required
            disabled={isPending}
          ></textarea>
          {state?.errors?.body && <p className="text-red-500 text-xs font-bold">{state.errors.body[0]}</p>}
        </div>

        {state?.message && (
          <div className={`p-4 rounded-xl text-sm font-bold border ${state.success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
            {state.message}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex gap-2 text-xs text-blue-800/70 font-medium items-center">
            <Info size={14} className="text-blue-400 shrink-0" />
            <span>回答は誰でも見ることができます。</span>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-md hover-lift disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
          >
            {isPending ? '投稿中...' : '回答を投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
