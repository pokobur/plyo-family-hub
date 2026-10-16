import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getQuestion } from "@/app/actions/qa";
import { checkUserLiked } from "@/app/actions/likes";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ShareButton from "@/components/shared/ShareButton";
import AnswerForm from "@/components/qa/AnswerForm";
import BestAnswerButton from "@/components/qa/BestAnswerButton";
import LikeButton from "@/components/shared/LikeButton";
import type { Answer } from "@/types";

export default async function QADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const [data, { data: { user } }] = await Promise.all([
    getQuestion(resolvedParams.id),
    supabase.auth.getUser(),
  ]);

  if (!data || !data.question) {
    notFound();
  }

  const { question, answers } = data;
  const isLiked = await checkUserLiked(question.id, 'question');
  const isQuestionOwner = Boolean(user && question.user_id && user.id === question.user_id);

  const date = new Date(question.created_at);
  const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      <Link 
        href="/qa" 
        className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors w-fit"
      >
        <ArrowLeft size={15} /> 知恵袋一覧に戻る
      </Link>

      {/* Question Section */}
      <article className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs relative">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-md text-xs">
              {question.category}
            </span>
            <span className="text-stone-400 font-medium">{formattedDate}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
            {question.title}
          </h1>

          <div className="flex items-center gap-2.5 py-1">
            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
              {question.author?.[0] || "パ"}
            </div>
            <div>
              <span className="text-xs font-bold text-stone-700">{question.author}</span>
            </div>
          </div>

          <div className="text-stone-700 leading-relaxed text-sm whitespace-pre-wrap py-2">
            {question.body}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <LikeButton
                targetId={question.id}
                type="question"
                initialLikes={question.likes || 0}
                initialIsLiked={isLiked}
                label="いいね"
                className="px-3.5 py-1.5 rounded-lg text-xs"
              />
              <ShareButton 
                size={15} 
                className="px-3 py-1.5 rounded-lg text-xs bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200" 
              />
            </div>
          </div>
        </div>
      </article>

      {/* Answers Section */}
      <div className="mt-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <MessageCircle className="text-primary" size={20} />
          {answers.length}件の回答
        </h2>

        <div className="flex flex-col gap-4">
          {answers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl text-stone-400 text-xs sm:text-sm font-medium border border-stone-200">
              まだ回答がありません。最初の回答者になりませんか？
            </div>
          ) : (
            answers.map((answer: Answer) => {
              const ansDate = new Date(answer.created_at);
              const formattedAnsDate = `${ansDate.getFullYear()}/${ansDate.getMonth() + 1}/${ansDate.getDate()} ${ansDate.getHours()}:${String(ansDate.getMinutes()).padStart(2, '0')}`;

              return (
                <article 
                  key={answer.id} 
                  className={`bg-white p-5 rounded-2xl border transition-all ${
                    answer.is_best 
                      ? 'border-amber-300 bg-amber-50/30 shadow-2xs' 
                      : 'border-stone-200 shadow-2xs'
                  }`}
                >
                  {answer.is_best && (
                    <div className="inline-block bg-amber-400 text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3">
                      ベストアンサー 👑
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-bold">
                        {answer.author?.[0] || "パ"}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">{answer.author}</span>
                        <span className="text-[10px] text-stone-400 font-medium">{formattedAnsDate}</span>
                      </div>
                    </div>
                    {isQuestionOwner && (
                      <BestAnswerButton
                        questionId={question.id}
                        answerId={answer.id}
                        isBest={Boolean(answer.is_best)}
                      />
                    )}
                  </div>
                  <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {answer.body}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Answer Form */}
      <div className="mt-4">
        <AnswerForm questionId={question.id} />
      </div>

    </div>
  );
}
