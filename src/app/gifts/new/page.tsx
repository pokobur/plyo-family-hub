'use client'

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Image, Plus, Trash, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createGiftItem } from "@/app/actions/gifts";

const CATEGORIES = ['衣類', 'おもちゃ', 'ベビーカー・バギー', 'ベビーベッド・寝具', '抱っこひも・おんぶ紐', 'お食事用品', 'その他'];
const CONDITIONS = ['新品同様', '目立った傷や汚れなし', 'やや傷や汚れあり', '使用感あり'];
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export default function NewGiftPage() {
  const router = useRouter();
  const supabase = createClient();

  const [state, formAction, isPending] = useActionState(createGiftItem, { message: "", errors: {} });
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Images state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Enforce limit of 4 images
      if (selectedFiles.length + files.length > 4) {
        alert("アップロードできる画像は最大4枚までです。");
        return;
      }

      setSelectedFiles(prev => [...prev, ...files]);

      // Create object URLs for local previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove selected image before upload
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Clean up local preview object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Perform client-side image uploads to Supabase Storage before submit
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUploading(true);
    setUploadError(null);
    const urls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('gift-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw new Error("Supabase Storage upload failed. Make sure 'gift-images' bucket is created and public.");
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gift-images')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      setUploadedUrls(urls);
      setUploadError(null);

      // Now construct the final form submit and dispatch it
      const formData = new FormData(e.currentTarget);
      formData.set('images_json', JSON.stringify(urls));
      
      formAction(formData);
    } catch (err: any) {
      console.error(err);
      setUploadError(
        "画像のアップロードに失敗しました。SupabaseのStorageにて「gift-images」という名前のパブリック(Public)バケットが作成されていることをご確認ください。一時的に画像なしで投稿する場合は、選択した画像をすべて削除してからお試しください。"
      );
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-primary/20 shadow-xs p-8">
        <Gift size={48} className="mx-auto text-primary opacity-30 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">ログインが必要です</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          おさがりアイテムを投稿するには、メンバーログインが必要です。アカウントをお持ちでない場合は新規登録をお願いします。
        </p>
        <Link
          href={`/login?next=/gifts/new`}
          className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors shadow-md text-sm cursor-pointer"
        >
          ログイン・新規登録はこちら
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Link href="/gifts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> アイテム一覧に戻る
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2.5 h-full bg-primary"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl">
            <Gift size={28} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">お譲りアイテムを投稿する</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">使わなくなった子供用品を登録して、次のパパママへギフトしましょう。</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-gray-700 text-sm">商品名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              placeholder="例: ベビービョルン バウンサー ブリス（メッシュ）"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              required
            />
            {state?.errors?.title && <p className="text-red-500 text-xs font-bold">{state.errors.title[0]}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-gray-700 text-sm">商品説明・お譲り条件 <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              placeholder="商品の状態や使用期間、付属品の有無、手渡しの場合の条件（平日18時以降希望など）を詳しくご記入ください。"
              rows={5}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y font-medium text-sm"
              required
            ></textarea>
            {state?.errors?.description && <p className="text-red-500 text-xs font-bold">{state.errors.description[0]}</p>}
          </div>

          {/* Image Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-gray-700 text-sm">商品画像（最大4枚まで）</label>
            
            <div className="grid grid-cols-4 gap-4 mt-1">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                  <img src={preview} alt={`選択画像-${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md cursor-pointer"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}

              {previews.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary transition-colors flex flex-col justify-center items-center gap-1 cursor-pointer bg-gray-50/50 hover:bg-primary/5">
                  <Image size={24} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-bold">画像を追加</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold leading-normal mt-1">※ 実物の状態がわかる写真をアップロードしてください（任意ですが、写真があると譲り先が見つかりやすくなります）。</p>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-700 text-sm">カテゴリ <span className="text-red-500">*</span></label>
              <select
                name="category"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                required
              >
                <option value="">カテゴリを選択してください</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {state?.errors?.category && <p className="text-red-500 text-xs font-bold">{state.errors.category[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-700 text-sm">商品の状態 <span className="text-red-500">*</span></label>
              <select
                name="condition"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                required
              >
                <option value="">商品の状態を選択してください</option>
                {CONDITIONS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
              {state?.errors?.condition && <p className="text-red-500 text-xs font-bold">{state.errors.condition[0]}</p>}
            </div>
          </div>

          {/* Delivery Method */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm">受け渡し方法 <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['手渡し', '郵送', '両方'].map(method => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery_method"
                    value={method}
                    defaultChecked={method === '手渡し'}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">{method === '両方' ? '手渡し・郵送どちらも可' : method}</span>
                </label>
              ))}
            </div>
            {state?.errors?.delivery_method && <p className="text-red-500 text-xs font-bold">{state.errors.delivery_method[0]}</p>}
          </div>

          {/* Location Area */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide">受け渡し場所・地域</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700 text-xs">都道府県 <span className="text-red-500">*</span></label>
                <select
                  name="prefecture"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="">都道府県を選択</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                {state?.errors?.prefecture && <p className="text-red-500 text-xs font-bold">{state.errors.prefecture[0]}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700 text-xs">市区町村 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="city"
                  placeholder="例: 世田谷区、横浜市港北区"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                  required
                />
                {state?.errors?.city && <p className="text-red-500 text-xs font-bold">{state.errors.city[0]}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-700 text-xs">受け渡し場所の目安・最寄り駅（任意）</label>
              <input
                type="text"
                name="location_hint"
                placeholder="例: 二子玉川駅付近、砧公園周辺など"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              />
              <p className="text-[9px] text-gray-400 font-bold">※ 正確な待ち合わせ場所や住所は、お譲り先が決定した後に非公開チャットで伝えるため、ここでは大まかな目安を入力してください。</p>
              {state?.errors?.location_hint && <p className="text-red-500 text-xs font-bold">{state.errors.location_hint[0]}</p>}
            </div>
          </div>

          {/* Error messages */}
          {uploadError && (
            <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-xs leading-relaxed">
              {uploadError}
            </div>
          )}
          {state?.message && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-sm">{state.message}</div>}

          {/* Form Actions */}
          <div className="mt-4 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link href="/gifts" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              キャンセル
            </Link>
            <button
              disabled={isPending || isUploading}
              type="submit"
              className="bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1.5 cursor-pointer"
            >
              {(isPending || isUploading) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isUploading ? "画像保存中..." : "送信中..."}
                </>
              ) : (
                <>お譲りを投稿する</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
