import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const GAME_MAP = {
  aizukan: {
    title: "AI図鑑",
    url: "https://game.plyo.blog/AIzukan/",
    description: "君の想像力で新しい生き物や道具を生み出す魔法の図鑑メーカー",
    icon: "📖",
    color: "from-[#ff9a8b] to-[#ff6a88] border-[#ff6a88]/20"
  },
  battleship: {
    title: "戦艦スタディRPG",
    url: "https://game.plyo.blog/battleship-study/",
    description: "勉強して船を強くしよう！算数や国語の問題を解いて最強の戦艦を育てるRPG",
    icon: "🚢",
    color: "from-[#00b09b] to-[#96c93d] border-[#00b09b]/20"
  },
  brainrot: {
    title: "ブレインロット",
    url: "https://game.plyo.blog/brainrot-game/",
    description: "フルーツを落として大きくする、やみつきパズルゲーム",
    icon: "🍉",
    color: "from-[#e65c00] to-[#f9d423] border-[#e65c00]/20"
  },
  habit: {
    title: "習慣ジオラマ",
    url: "https://game.plyo.blog/habit-diorama/",
    description: "毎日のタスクをこなして、自分だけのジオラマを作る習慣づけツール",
    icon: "🏞️",
    color: "from-[#8e2de2] to-[#4a00e0] border-[#8e2de2]/20"
  },
  pixel: {
    title: "ピクセルマジック",
    url: "https://game.plyo.blog/pixel-magic-adventurer/",
    description: "魔法のお絵かきアドベンチャーゲーム",
    icon: "✨",
    color: "from-[#a18cd1] to-[#fbc2eb] border-[#a18cd1]/20"
  },
  animal: {
    title: "どうぶつステップ",
    url: "https://game.plyo.blog/animal-step/",
    description: "おやこで対面ミニ将棋ゲーム",
    icon: "🌳",
    color: "from-[#81c784] to-[#2e7d32] border-[#2e7d32]/20"
  }
};

type GameKey = keyof typeof GAME_MAP;

export default async function GameEmbedPage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = await params;
  const gameKey = resolvedParams.gameId as GameKey;
  const game = GAME_MAP[gameKey];

  if (!game) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 h-full pb-6">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/games" className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-full transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{game.icon}</span>
            <div>
              <h1 className="font-black text-lg text-gray-800 leading-tight">{game.title}</h1>
              <p className="text-[11px] text-gray-400 font-medium">{game.description}</p>
            </div>
          </div>
        </div>
        <a 
          href={game.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-full text-xs transition-colors border border-gray-200 shadow-sm"
        >
          全画面（別タブ）で開く <ExternalLink size={14} />
        </a>
      </div>

      {/* Embedded Game View */}
      <div className={`relative w-full aspect-[4/3] md:h-[650px] bg-gray-900 rounded-[2.5rem] overflow-hidden border-4 bg-gradient-to-br ${game.color} shadow-2xl flex flex-col`}>
        <iframe 
          src={game.url} 
          title={game.title}
          className="w-full h-full flex-1 border-none bg-white rounded-[2rem] overflow-hidden shadow-inner"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

    </div>
  );
}
