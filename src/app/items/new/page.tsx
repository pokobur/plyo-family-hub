'use client'

import { ArrowLeft, Heart, Search, Info, Star, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createItem, searchProducts } from "@/app/actions/items";

function NewItemPageContent() {
  const [state, formAction, isPending] = useActionState(createItem, { message: "", errors: {} });
  const [rating, setRating] = useState(5);

  // Search state variables
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [shopPlatform, setShopPlatform] = useState<"楽天" | "Amazon">("楽天");
  const [hasSearched, setHasSearched] = useState(false);

  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Pre-populate search and search automatically if "q" query param is present
  useEffect(() => {
    if (query) {
      setSearchKeyword(query);
      const doInitialSearch = async () => {
        setIsSearching(true);
        setHasSearched(true);
        try {
          const results = await searchProducts(query);
          setSearchResults(results);
          if (results.length > 0) {
            const firstItem = results[0];
            setSelectedItem(firstItem);
            setItemTitle(firstItem.title);
            setItemImageUrl(firstItem.imageUrl);
            setShopPlatform(firstItem.platform as "楽天" | "Amazon");
          }
        } catch (error) {
          console.error("Initial search failed:", error);
        } finally {
          setIsSearching(false);
        }
      };
      doInitialSearch();
    }
  }, [query]);

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchKeyword.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchProducts(searchKeyword);
      setSearchResults(results);
      if (results.length > 0) {
        const firstItem = results[0];
        setSelectedItem(firstItem);
        setItemTitle(firstItem.title);
        setItemImageUrl(firstItem.imageUrl);
        setShopPlatform(firstItem.platform as "楽天" | "Amazon");
      } else {
        setSelectedItem(null);
        setItemTitle("");
        setItemImageUrl("");
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setItemTitle(item.title);
    setItemImageUrl(item.imageUrl);
    setShopPlatform(item.platform as "楽天" | "Amazon");
  };

  const getSubmitUrl = () => {
    if (!selectedItem) return "";
    if (selectedItem.platform === shopPlatform) {
      return selectedItem.url;
    }
    if (shopPlatform === "Amazon") {
      return `https://www.amazon.co.jp/s?k=${encodeURIComponent(itemTitle)}`;
    }
    return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(itemTitle)}/`;
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link href="/items" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> アイテム一覧に戻る
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl">
            <Heart size={28} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">おすすめアイテムを共有する</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">「買ってよかった！」と思うおすすめアイテムをパパママ仲間にシェアしましょう。</p>
          </div>
        </div>

        {/* Form area */}
        <form action={formAction} className="flex flex-col gap-8">
          {/* Hidden inputs to send search details to Server Action */}
          <input type="hidden" name="title" value={itemTitle || ''} />
          <input type="hidden" name="image_url" value={itemImageUrl || ''} />
          <input type="hidden" name="original_url" value={getSubmitUrl()} />
          <input type="hidden" name="platform" value={shopPlatform} />

          {/* Step 1: Product URL & Auto-Retrieve */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">1</span>
              <label className="font-bold text-gray-800">商品のURLを貼り付ける</label>
            </div>

            {/* Search Input bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="url" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                  placeholder="楽天やAmazonの商品ページのURLを貼り付けてください（https://...）" 
                  className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button 
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-md hover:shadow-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {isSearching ? '読込中...' : '商品情報を取得'}
              </button>
            </div>

            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-2 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl p-2">
                {searchResults.map((item, index) => {
                  const isSelected = selectedItem?.title === item.title;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full border cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-md border border-gray-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          価格目安: {item.price && !isNaN(parseInt(item.price)) ? `${parseInt(item.price).toLocaleString()}円` : '価格情報なし'}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200'}`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {hasSearched && searchResults.length === 0 && !isSearching && (
              <p className="text-xs text-red-500 font-bold mt-1">商品情報を取得できませんでした。有効な商品URL（https://...）を貼り付けてください。</p>
            )}

            {/* Selected Product Edit / Preview */}
            {selectedItem && (
              <div className="mt-4 bg-white border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-primary/10 text-primary-dark font-black px-2 py-0.5 rounded">商品情報の確認・編集</span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Title Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">商品名 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={itemTitle} 
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs"
                      placeholder="商品名を入力してください"
                      required
                    />
                    {state?.errors?.title && <p className="text-red-500 text-[11px] font-bold mt-0.5">{state.errors.title[0]}</p>}
                  </div>

                  {/* Image URL Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">画像URL <span className="text-red-500">*</span></label>
                    <input 
                      type="url" 
                      value={itemImageUrl} 
                      onChange={(e) => setItemImageUrl(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs"
                      placeholder="画像URLを入力してください"
                      required
                    />
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">
                      ※ Amazonなどで画像が自動取得されない場合、Amazonの画像を右クリックして「画像アドレスをコピー」し、ここに貼り付けてください。
                    </p>
                    {state?.errors?.image_url && <p className="text-red-500 text-[11px] font-bold mt-0.5">{state.errors.image_url[0]}</p>}
                  </div>

                  {/* Image Preview */}
                  {itemImageUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl w-fit">
                      <img 
                        src={itemImageUrl} 
                        alt="プレビュー" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
                        }}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0" 
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold">表示画像プレビュー</span>
                        <span className="text-[9px] text-gray-300 font-medium truncate max-w-[200px]">{itemImageUrl}</span>
                      </div>
                    </div>
                  )}

                  {/* Shop/Platform Toggle */}
                  <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                    <span className="text-xs font-bold text-gray-600">紹介するショップを選択:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="shop_select" 
                          checked={shopPlatform === "楽天"}
                          onChange={() => setShopPlatform("楽天")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">楽天市場として紹介</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="shop_select" 
                          checked={shopPlatform === "Amazon"}
                          onChange={() => setShopPlatform("Amazon")}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">Amazonとして紹介</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {state?.errors?.original_url && <p className="text-red-500 text-xs font-bold">商品を選択してください。</p>}
          </div>

          {/* Step 2: Review Content */}
          <div className="flex flex-col gap-5 pl-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">2</span>
              <label className="font-bold text-gray-800">レビューを書く</label>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">カテゴリ <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['知育・おもちゃ', '時短・家事', '寝かしつけ', 'お出かけ', '離乳食・食事', 'マタニティ', 'その他'].map(cat => (
                  <label key={cat} className="cursor-pointer">
                    <input type="radio" name="category" value={cat} className="peer sr-only" defaultChecked={cat === '知育・おもちゃ'} />
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-gray-500 peer-checked:bg-primary/10 peer-checked:text-primary-dark peer-checked:border-primary/30 hover:bg-gray-100 transition-colors">
                      {cat}
                    </div>
                  </label>
                ))}
              </div>
              {state?.errors?.category && <p className="text-red-500 text-xs font-bold">{state.errors.category[0]}</p>}
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">おすすめ度 <span className="text-red-500">*</span></label>
              <input type="hidden" name="rating" value={rating} />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    type="button" 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`transition-colors cursor-pointer ${star <= rating ? 'text-secondary' : 'text-gray-300 hover:text-secondary/50'}`}
                  >
                    <Star size={32} className={star <= rating ? 'fill-secondary' : ''} />
                  </button>
                ))}
              </div>
              {state?.errors?.rating && <p className="text-red-500 text-xs font-bold">{state.errors.rating[0]}</p>}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700 text-sm">
                おすすめの理由 <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description"
                placeholder="どんな悩みが解決したか、どのようなシーンで役立っているかなど、具体的に教えてください。" 
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y font-medium text-sm"
                required
              ></textarea>
              {state?.errors?.description && <p className="text-red-500 text-xs font-bold">{state.errors.description[0]}</p>}
            </div>
            
            {/* Guidelines hint */}
            <div className="flex gap-2 p-3 bg-amber-50 rounded-xl mt-1 border border-amber-100">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                ご自身が実際に購入し、使用したアイテムのみご投稿ください。商品リンクはシステム側で自動的に生成・付与されます。
              </p>
            </div>
          </div>

          {state?.message && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-sm">{state.message}</div>}

          {/* Submit Action */}
          <div className="mt-4 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link href="/items" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              キャンセル
            </Link>
            <button 
              disabled={isPending || !selectedItem} 
              type="submit" 
              className="bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            >
              {isPending ? '投稿中...' : 'アイテムを投稿する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function NewItemPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-500 font-bold">
        読み込み中...
      </div>
    }>
      <NewItemPageContent />
    </Suspense>
  );
}
