import { MessageCircle, Edit3 } from "lucide-react";
import Link from "next/link";
import { getQuestions } from "@/app/actions/qa";
import QAListClient from "./QAListClient";

export const revalidate = 0; // Dynamic rendering for latest questions

export default async function QAPage() {
  const questions = await getQuestions();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-[#f9f3ed] to-[#f4ece5] p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-stone-900">
            <MessageCircle className="text-primary" size={24} />
            子育て知恵袋
          </h1>
          <p className="text-stone-600 font-medium text-xs sm:text-sm">
            育児のささいな悩みから保育園選びまで。先輩パパママに気軽に相談してみましょう。
          </p>
        </div>
        <Link 
          href="/qa/new" 
          className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs hover-lift text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          <Edit3 size={16} />
          質問を投稿する
        </Link>
      </div>

      {/* Interactive Filterable Q&A List */}
      <QAListClient initialQuestions={questions} />
    </div>
  );
}
