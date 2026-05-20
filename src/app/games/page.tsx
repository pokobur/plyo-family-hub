import { Gamepad2, Sparkles, Flame } from "lucide-react";
import Link from "next/link";

export default function GamesPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      
      {/* Header Area */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-black mb-4 flex items-center justify-center gap-2">
          <Gamepad2 className="text-primary" />
          子供とあそぶ（息抜きコンテンツ）
        </h1>
        <p className="text-gray-600 font-medium">
          親子で楽しめる知育アプリや、ちょっとした息抜きに最適なミニゲーム。<br/>
          すべて無料で遊べます。
        </p>
      </div>

      {/* Featured Game */}
      <Link href="/games/aizukan" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff9a8b] to-[#ff6a88] p-8 md:p-12 text-white shadow-lg hover-lift block border-4 border-transparent hover:border-white/50 transition-all">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-white/20 rounded-2xl flex items-center justify-center text-6xl md:text-8xl backdrop-blur-sm shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500 origin-center">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white text-[#ff5252] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Flame size={12} /> Featured
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">キミは何の博士？<br/>不思議なAIの世界</h2>
            <p className="text-white/90 font-medium mb-6 text-lg max-w-xl">
              「AI図鑑」は、君の想像力で新しい生き物や道具を生み出す魔法の図鑑メーカーです。
            </p>
            <div className="inline-flex bg-white text-[#ff6a88] font-bold px-8 py-4 rounded-full items-center gap-2 group-hover:bg-gray-50 transition-colors shadow-md">
              <Sparkles size={18} /> 今すぐあそぶ
            </div>
          </div>
        </div>
      </Link>

      {/* Other Games Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1 */}
        <Link href="/games/battleship" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#00b09b] transition-all group block hover-lift">
          <div className="w-16 h-16 bg-[#00b09b]/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-bottom-left">
            🚢
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">戦艦スタディRPG</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">勉強して船を強くしよう！算数や国語の問題を解いて、最強の戦艦を育てます。</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">学習ゲーム</span>
            <span className="text-sm font-bold text-[#00b09b] flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Play <Gamepad2 size={14}/></span>
          </div>
        </Link>

        {/* Game 2 */}
        <Link href="/games/brainrot" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#e65c00] transition-all group block hover-lift">
          <div className="w-16 h-16 bg-[#e65c00]/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-bottom-left">
            🍉
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">ブレインロット</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">フルーツを落として大きくする、やみつきパズルゲーム。スキマ時間に最適です。</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">パズル</span>
            <span className="text-sm font-bold text-[#e65c00] flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Play <Gamepad2 size={14}/></span>
          </div>
        </Link>

        {/* Game 3 */}
        <Link href="/games/habit" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8e2de2] transition-all group block hover-lift">
          <div className="w-16 h-16 bg-[#8e2de2]/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-bottom-left">
            🏞️
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">習慣ジオラマ</h3>
          <p className="text-sm text-gray-500 font-medium mb-6">毎日のタスクをこなして、自分だけのジオラマを作ろう。お片付けや手洗いの習慣づけに。</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">習慣化ツール</span>
            <span className="text-sm font-bold text-[#8e2de2] flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Play <Gamepad2 size={14}/></span>
          </div>
        </Link>
      </div>

    </div>
  );
}
