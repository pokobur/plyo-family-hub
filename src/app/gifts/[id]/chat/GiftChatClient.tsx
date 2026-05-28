'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendGiftMessage, completeGiftTransaction } from "@/app/actions/gifts";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, MessageSquare, Send, CheckCircle2, Info, Loader2 } from "lucide-react";
import Link from "next/link";

interface GiftChatClientProps {
  item: any;
  currentUserId: string;
}

export default function GiftChatClient({ item, currentUserId }: GiftChatClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>(item.messages || []);
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
          // Add new message if it isn't already in state
          const newMsg = payload.new;
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
  }, [item.id]);

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
      // Client-side optimistic update or rely on realtime subscription
    } catch (err: any) {
      setError(err.message || "メッセージの送信に失敗しました。");
      setInputText(textToSend); // Restore text on failure
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 h-[80vh] md:h-[85vh]">
      {/* Top Header Panel */}
      <div className="glass-panel p-4 rounded-2xl border border-primary/20 shadow-xs flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <Link href={`/gifts/${item.id}`} className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="font-bold text-sm text-gray-800 line-clamp-1">{item.title}</h2>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
              お譲り先: {isOwner ? '確定したパパママ' : '出品者'} とのチャット
            </span>
          </div>
        </div>

        {/* Deal Status & Controls */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="bg-gray-100 text-gray-500 border border-gray-200 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={14} className="text-gray-400" /> 取引完了
            </span>
          ) : (
            <button
              onClick={handleCompleteTransaction}
              disabled={isCompleting}
              className="bg-green-500 text-white font-black px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors shadow-xs hover-lift text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
        <div className="flex gap-2.5 p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-[10px] text-blue-800 leading-normal font-bold shrink-0">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-blue-900 block mb-0.5 font-black">💬 取引調整のアドバイス</span>
            <span className="font-medium">
              手渡しの場合は「待ち合わせ日時・場所」、郵送の場合は「発送先の住所・氏名・配達希望時間（着払い料金目安）」などをこちらで合意してください。お譲りが完了したら「取引完了にする」ボタンを押してください。
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
        {messages.length > 0 ? (
          messages.map((msg: any) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] gap-1.5 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none shadow-xs' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-[9px] text-gray-400 font-bold px-1">
                  {new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <MessageSquare size={36} className="text-gray-300" />
            <p className="text-xs text-gray-400 font-bold">チャットメッセージはまだありません。<br />最初のメッセージを送ってみましょう！</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="shrink-0 flex flex-col gap-2">
        {error && (
          <p className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>
        )}
        
        {isCompleted ? (
          <div className="bg-gray-100 text-gray-500 border border-gray-200 p-4 rounded-2xl text-center text-xs font-bold">
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
              className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="bg-primary text-white font-bold px-5 py-3.5 rounded-2xl hover:bg-primary-dark transition-all shadow-md flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
