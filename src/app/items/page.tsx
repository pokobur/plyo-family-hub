import UgcCta from "@/components/items/UgcCta";
import { Heart } from "lucide-react";
import { getItems } from "@/app/actions/items";
import ItemListClient from "./ItemListClient";

export const revalidate = 0; // Dynamic rendering for latest items

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Header Area */}
      <div className="text-center py-4 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary mb-1">
          <Heart size={20} className="fill-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          先輩パパママのおすすめアイテム
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xl leading-relaxed">
          「本当に買って助かった！」と実感した育児QOL向上アイテムが集まるレビュー広場です。<br className="hidden sm:inline" />
          あなたのおすすめもぜひシェアしてください。
        </p>
      </div>

      {/* UGC Submission CTA */}
      <UgcCta />

      {/* Interactive Filterable Item List */}
      <ItemListClient initialItems={items} />

    </div>
  );
}
