import { MessageCircle, Search, Edit3, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getQuestions } from "@/app/actions/qa";

export default async function QAPage() {
  const questions = await getQuestions();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      
      {/* Header & CTA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-[2rem] border border-blue-100 shadow-sm">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-2 text-blue-900">
            <MessageCircle className="text-blue-500 fill-blue-500" />
            子育て知恵袋
          </h1>
          <p className="text-blue-800/80 font-medium text-sm">
            育児の悩み、みんなで解決。些細なことでも気軽に相談してみましょう。
          </p>
        </div>
        <Link href="/qa/new" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl hover-lift shrink-0">
          <Edit3 size={18} />
          質問を投稿する
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input type="text" placeholder="キーワードで悩みを検索..." className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-500 shadow-sm" />
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <button className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">新着順</button>
          <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors">回答が多い順</button>
          <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-colors">閲覧数順</button>
        </div>
      </div>

      {/* Q&A List */}
      <div className="flex flex-col gap-4">
        {questions.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 font-bold">
            まだ質問がありません。最初の質問を投稿してみましょう！
          </div>
        ) : (
          questions.map((item) => {
            // date formatting
            const date = new Date(item.created_at);
            const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            return (
              <Link key={item.id} href={`/qa/${item.id}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group block">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{item.category}</span>
                  <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{item.body}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">👤</div>
                    <span className="text-xs text-gray-500 font-medium">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={14} /> {item.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={14} /> {item.answers?.[0]?.count || 0} 件の回答</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {questions.length > 0 && (
        <div className="flex justify-center mt-2">
          <button className="bg-white border border-gray-200 text-gray-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
