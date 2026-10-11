import { getGiftItems } from "@/app/actions/gifts";
import Link from "next/link";
import { Plus, Gift, Info } from "lucide-react";
import GiftListClient from "./GiftListClient";

export const revalidate = 0; // Dynamic rendering to always fetch latest items

export default async function GiftsPage() {
  const items = await getGiftItems();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#f9f4ee] via-[#faf6f0] to-[#f3eae0] rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs">
        <div className="max-w-2xl flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-stone-200/70 rounded-full text-xs font-bold text-stone-700 w-fit shadow-2xs">
            <Gift size={13} className="text-secondary" />
            <span>おさがり・お譲りボード</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-snug tracking-tight">
            次のパパ・ママへ、<br className="hidden sm:inline" />
            温かい「おさがり」のバトン。
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            サイズアウトした子供服、使わなくなったベビーカーやベビーベッドなど。
            捨てるのはもったいない思い出の品を、地域のパパママに無料で譲り合いませんか？
          </p>

          <div className="pt-2">
            <Link 
              href="/gifts/new" 
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-2xs hover-lift text-xs sm:text-sm cursor-pointer"
            >
              <Plus size={16} /> お譲りアイテムを投稿する
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Note */}
      <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
        <Info size={16} className="text-stone-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-stone-700 block mb-0.5">ご利用にあたって</span>
          当ボードでの金銭のやり取りは一切禁止です（すべて無料譲渡）。受け渡しは「安全な公共の場所（公園や駅改札等）での手渡し」または「着払い郵送」にて、お互いにマナーを守って温かく交流しましょう。
        </div>
      </div>

      {/* Client List containing filters and search */}
      <GiftListClient initialItems={items} />
    </div>
  );
}
