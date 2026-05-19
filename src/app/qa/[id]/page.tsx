import { MessageCircle, Heart, Share2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getQuestion } from "@/app/actions/qa";
import { notFound } from "next/navigation";

export default async function QADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // Fetch data based on params.id
  const data = await getQuestion(resolvedParams.id);

  if (!data || !data.question) {
    notFound();
  }

  const { question, answers } = data;

  const date = new Date(question.created_at);
  const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/qa" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> 知恵袋一覧に戻る
      </Link>

      {/* Question Section */}
      <article className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-400 rounded-l-3xl"></div>
        
        <div className="flex flex-col gap-4 pl-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{question.category}</span>
            <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {question.title}
          </h1>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">👤</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-700">{question.author}</span>
            </div>
          </div>

          <div className="text-gray-700 leading-loose text-[15px] whitespace-pre-wrap">
            {question.body}
          </div>

          <div className="flex items-center justify-between pt-6 mt-2 border-t border-gray-100">
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
                <Heart size={16} /> {question.likes} いいね
              </button>
              <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
                <Share2 size={16} /> シェア
              </button>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <AlertCircle size={18} />
            </button>
          </div>
        </div>
      </article>

      {/* Answers Section */}
      <div className="mt-4">
        <h2 className="text-xl font-black flex items-center gap-2 mb-6">
          <MessageCircle className="text-blue-500" />
          {answers.length}件の回答
        </h2>

        <div className="flex flex-col gap-6">
          {answers.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-500 font-medium border border-gray-100">
              まだ回答がありません。最初の回答者になりませんか？
            </div>
          ) : (
            answers.map((answer) => {
              const ansDate = new Date(answer.created_at);
              const formattedAnsDate = `${ansDate.getFullYear()}/${ansDate.getMonth() + 1}/${ansDate.getDate()} ${ansDate.getHours()}:${String(ansDate.getMinutes()).padStart(2, '0')}`;

              return (
                <article key={answer.id} className={`bg-white p-6 rounded-2xl border ${answer.is_best ? 'border-yellow-300 shadow-md bg-yellow-50/30' : 'border-gray-100 shadow-sm'}`}>
                  {answer.is_best && (
                    <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full mb-4 flex items-center gap-1 w-fit">
                      ベストアンサー 👑
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">👤</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">{answer.author}</span>
                        <span className="text-xs text-gray-400 font-medium">{formattedAnsDate}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap mb-4">
                    {answer.body}
                  </p>
                  <div className="flex justify-end pt-4 border-t border-gray-100/50">
                    <button className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                      <Heart size={14} /> 参考になった ({answer.likes})
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>

      {/* Post Answer CTA */}
      <div className="mt-8 bg-blue-50 p-6 md:p-8 rounded-3xl border border-blue-100 text-center">
        <h3 className="font-bold text-blue-900 mb-2">あなたも回答してみませんか？</h3>
        <p className="text-sm text-blue-800/80 mb-6">あなたの経験が、他のパパママの助けになります。</p>
        <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md hover-lift">
          回答を投稿する
        </button>
      </div>

    </div>
  );
}
