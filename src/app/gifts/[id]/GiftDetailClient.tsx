'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyForGift, confirmReceiver } from "@/app/actions/gifts";
import { Gift, MessageSquare, CheckCircle, Info, Heart, ArrowRight, User } from "lucide-react";
import Link from "next/link";

interface GiftDetailClientProps {
  item: any;
  currentUserId: string | null;
}

export default function GiftDetailClient({ item, currentUserId }: GiftDetailClientProps) {
  const router = useRouter();
  const [applyMessage, setApplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const isOwner = currentUserId === item.user_id;
  const hasApplied = item.applications.some((app: any) => app.applicant_id === currentUserId);
  const isMatchedReceiver = currentUserId === item.selected_receiver_id;

  const imagesList = item.images && item.images.length > 0 
    ? item.images 
    : ["https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"];

  // Handle Application Submit (Receiver)
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await applyForGift(item.id, applyMessage);
      router.refresh();
      setApplyMessage("");
    } catch (err: any) {
      setError(err.message || "応募に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Winner Selection (Owner)
  const handleSelectReceiver = async (applicantId: string) => {
    if (!confirm("本当にこのユーザーをお譲り先に選んで取引を開始しますか？確定すると専用の取引チャットが作成されます。")) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmReceiver(item.id, applicantId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "取引の開始に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns - Pictures & Description */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Images Area */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-xs relative">
            <img 
              src={imagesList[activeImage]} 
              alt={item.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          {imagesList.length > 1 && (
            <div className="flex gap-3">
              {imagesList.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === idx ? 'border-primary shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`サムネイル-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description Panel */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-primary/10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary-dark text-xs font-black px-2.5 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs text-gray-500 font-bold">
                商品の状態: <span className="text-gray-700">{item.condition}</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gray-800 leading-tight mt-1">{item.title}</h1>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">商品の詳細・お譲り条件</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{item.description}</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3 text-xs text-gray-600 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-400">受け渡し方法</span>
              <span>
                {item.delivery_method === '両方' ? '直接手渡し・郵送どちらも可' : item.delivery_method}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-gray-400">主な対応地域</span>
              <span>{item.prefecture} {item.city}</span>
            </div>
            {item.location_hint && (
              <div className="flex items-center gap-2">
                <span className="w-20 text-gray-400">目安の場所</span>
                <span className="font-medium text-gray-500">{item.location_hint}</span>
              </div>
            )}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-1">
              <span className="w-20 text-gray-400">投稿日</span>
              <span className="font-medium text-gray-500">
                {new Date(item.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Deal Interaction Box */}
      <div className="flex flex-col gap-6">
        {/* Deal Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-primary/20 shadow-xs flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
          
          <h3 className="font-black text-gray-800 text-sm border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <Gift size={18} className="text-primary fill-primary" /> お譲り取引の状況
          </h3>

          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          {/* OWNER PERSPECTIVE */}
          {isOwner && (
            <div className="flex flex-col gap-4">
              {item.status === 'open' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                    お譲り先を選定中（応募者: {item.applications.length}人）
                  </div>
                  
                  {item.applications.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                      {item.applications.map((app: any) => (
                        <div key={app.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                            <div className="bg-primary/10 p-1 rounded-md text-primary">
                              <User size={12} />
                            </div>
                            <span>応募者</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-normal font-medium whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-gray-100">
                            {app.message}
                          </p>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSelectReceiver(app.applicant_id)}
                            className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            お譲り先に選ぶ <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-bold text-center py-6">現在、まだ応募はありません。パパママからの応募をお待ちください。</p>
                  )}
                </div>
              )}

              {(item.status === 'matched' || item.status === 'completed') && (
                <div className="flex flex-col gap-4">
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CheckCircle size={16} className="text-blue-600 shrink-0" />
                      お譲り先が決定しました！
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                      専用の取引チャットルームで受け渡し日時や場所、発送先などを調整してください。
                    </p>
                  </div>
                  <Link
                    href={`/gifts/${item.id}/chat`}
                    className="w-full bg-primary text-white font-black py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-sm"
                  >
                    <MessageSquare size={16} /> 取引チャットへ進む
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* VISITOR PERSPECTIVE */}
          {!isOwner && (
            <div className="flex flex-col gap-4">
              {/* Not Logged In */}
              {!currentUserId && (
                <div className="flex flex-col gap-4 text-center">
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">このお譲りアイテムに応募するには、メンバーログインが必要です。</p>
                  <Link
                    href={`/login?next=/gifts/${item.id}`}
                    className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-md text-xs"
                  >
                    ログインして応募する
                  </Link>
                </div>
              )}

              {/* Logged In, Matched Receiver */}
              {currentUserId && isMatchedReceiver && (
                <div className="flex flex-col gap-4">
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                      お譲り先に選ばれました！
                    </div>
                    <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                      おめでとうございます！出品者と専用チャットでやり取りができます。
                    </p>
                  </div>
                  <Link
                    href={`/gifts/${item.id}/chat`}
                    className="w-full bg-primary text-white font-black py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-sm"
                  >
                    <MessageSquare size={16} /> 取引チャットへ進む
                  </Link>
                </div>
              )}

              {/* Logged In, Already Applied */}
              {currentUserId && hasApplied && !isMatchedReceiver && (
                <div className="bg-gray-50 text-gray-600 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center gap-3">
                  <div className="bg-green-100 text-green-700 p-3 rounded-full">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">応募完了</h4>
                    <p className="text-[11px] text-gray-400 font-bold mt-1 leading-relaxed">
                      応募は完了しています。出品者がお譲り先を決定するまでお待ちください。選ばれるとチャットが開設されます。
                    </p>
                  </div>
                </div>
              )}

              {/* Logged In, Open, Not Applied */}
              {currentUserId && !hasApplied && item.status === 'open' && (
                <form onSubmit={handleApply} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-gray-700 text-xs">出品者へのメッセージ（5文字以上）</label>
                    <textarea
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="挨拶や、お譲りを受けたい理由、手渡し可能な曜日・時間帯などを丁寧に記入して応募してください。"
                      rows={4}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                      required
                    ></textarea>
                    {applyMessage.length > 0 && applyMessage.trim().length < 5 && (
                      <p className="text-red-500 text-[10px] font-bold">メッセージは5文字以上で入力してください。</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || applyMessage.trim().length < 5}
                    className="w-full bg-primary text-white font-black py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "応募中..." : "譲ってほしい！"}
                  </button>
                </form>
              )}

              {/* Logged In, Matched to someone else / Completed */}
              {currentUserId && !hasApplied && !isMatchedReceiver && item.status !== 'open' && (
                <div className="bg-gray-50 text-gray-400 p-5 rounded-2xl border border-gray-100 text-center text-xs font-bold leading-relaxed">
                  このお譲りは現在、交渉中または既に取引完了しています。
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meetup Safety Alert */}
        <div className="flex gap-2.5 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-[10px] text-blue-800/80 leading-normal font-bold">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-blue-900 block mb-0.5">🤝 直接手渡しの安心ルール</span>
            <span className="font-medium">
              対面でおさがりを受け渡す際は、日中の明るい時間帯に、駅改札口や交番の近く、公園など人通りの多い公共の場所で行うようにしてください。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
