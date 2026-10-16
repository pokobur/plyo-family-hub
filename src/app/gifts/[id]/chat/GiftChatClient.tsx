'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendGiftMessage, completeGiftTransaction } from "@/app/actions/gifts";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, MessageSquare, Send, CheckCircle2, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import type { GiftItem, GiftMessage } from "@/types";

interface GiftChatClientProps {
  item: GiftItem & { messages: GiftMessage[] };
  currentUserId: string;
}

export default function GiftChatClient({ item, currentUserId }: GiftChatClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<GiftMessage[]>(item.messages || []);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId === item.user_id;
  const isCompleted = item.status === 'completed';

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Supabase Realtime Subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`gift_chat_${item.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gift_messages',
          filter: `gift_item_id=eq.${item.id}`
        },
        (payload) => {
          const newMsg = payload.new as GiftMessage;
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.id, supabase]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || isCompleted) return;

    setIsSending(true);
    setError(null);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      await sendGiftMessage(item.id, textToSend);
    } catch (err: any) {
      setError(err.message || "メッセージの送信に失敗しました。");
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Complete Transaction
  const handleCompleteTransaction = async () => {
    if (!confirm("お譲りと受け渡しが完了しましたか？取引完了に設定するとチャットが締め切られます。")) {
      return;
    }

    setIsCompleting(true);
    setError(null);
    try {
      await completeGiftTransaction(item.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "取引完了処理に失敗しました。");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 h-[80vh] md:h-[85vh]">
      {/* Top Header Panel */}
      <div className="p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <Link href={`/gifts/${item.id}`} className="text-stone-500 hover:text-stone-800 transition-colors p-2 rounded-full hover:bg-stone-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-bold text-sm text-stone-900 line-clamp-1">{item.title}</h2>
            <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
              お譲り先: {isOwner ? '確定したパパママ' : '出品者'} との専用チャット
            </span>
          </div>
        </div>

        {/* Deal Status & Controls */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="bg-stone-100 text-stone-500 border border-stone-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} className="text-stone-400" /> 取引完了
            </span>
          ) : (
            <button
              onClick={handleCompleteTransaction}
              disabled={isCompleting}
              className="bg-accent text-white font-bold px-4 py-1.5 rounded-lg hover:bg-accent-dark transition-colors shadow-2xs hover-lift text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isCompleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              取引完了にする
            </button>
          )}
        </div>
      </div>

      {/* Guide Note */}
      {!isCompleted && (
        <div className="flex gap-2.5 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed shrink-0">
          <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">💬 取引調整のアドバイス</span>
            <span className="text-amber-800/90 font-medium">
              手渡しの場合は「待ち合わせ日時・場所」、郵送の場合は「発送先の住所・氏名・配達希望時間（着払い料金目安）」などをこちらで合意してください。お譲りが完了したら「取引完了にする」ボタンを押してください。
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-4 md:p-6 overflow-y-auto flex flex-col gap-4 shadow-2xs">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] gap-1 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none shadow-2xs' 
                    : 'bg-stone-100 text-stone-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-[10px] text-stone-400 font-medium px-1">
                  {new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <MessageSquare size={32} className="text-stone-300" />
            <p className="text-xs text-stone-400 font-medium">チャットメッセージはまだありません。<br />最初のメッセージを送ってみましょう！</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="shrink-0 flex flex-col gap-2">
        {error && (
          <p className="text-red-600 text-xs font-bold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>
        )}
        
        {isCompleted ? (
          <div className="bg-stone-100 text-stone-500 border border-stone-200 p-4 rounded-2xl text-center text-xs font-bold">
            この取引は完了しているため、チャットの投稿は締め切られました。お取引ありがとうございました！
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="メッセージを入力してください..."
              disabled={isSending}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all font-medium text-stone-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="bg-primary text-white font-bold px-5 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-2xs flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
