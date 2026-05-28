import { getGiftItems } from "@/app/actions/gifts";
import Link from "next/link";
import { Plus, Gift, Info } from "lucide-react";
import GiftListClient from "./GiftListClient";

export const revalidate = 0; // Dynamic rendering to always fetch latest items

export default async function GiftsPage() {
  const items = await getGiftItems();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-indigo-900 text-white p-8 md:p-12 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <div className="bg-white/15 w-fit px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1">
            <Gift size={12} className="fill-white" /> おさがり・お譲りボード
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            次のパパ・ママへ、<br />
            温かい「おさがり」のバトン
          </h1>
          <p className="text-sm md:text-base text-indigo-100 font-bold leading-relaxed mt-1">
            サイズアウトした子供服、使わなくなったベビーカーやベビーベッドなど。
            捨てるのはもったいない思い出の品を、地域のパパママに無料で譲り合いませんか？
          </p>
          <div className="flex gap-4 mt-2">
            <Link 
              href="/gifts/new" 
              className="bg-secondary text-white font-black px-6 py-3 rounded-full hover:bg-secondary-dark transition-all flex items-center gap-1.5 shadow-lg hover:shadow-xl hover-lift text-sm cursor-pointer"
            >
              <Plus size={18} /> お譲りアイテムを投稿する
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Warning Note */}
      <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-bold">
          <p className="mb-1">⚠️ ご利用にあたっての注意事項</p>
          <p className="font-medium text-amber-800/80">
            当ボードでの金銭のやり取りは一切禁止です（すべて無料譲渡）。受け渡し方法は「直接手渡し（改札付近や公園など安全な公共の場所）」または「着払い郵送」となります。お互いにマナーを守って温かくお譲り合いましょう。
          </p>
        </div>
      </div>

      {/* Client List containing filters and search */}
      <GiftListClient initialItems={items} />
    </div>
  );
}
