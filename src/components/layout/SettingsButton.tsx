'use client'

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Settings, X, User as UserIcon, LogIn, LogOut, ChevronRight, Edit3, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setMounted(true);
    const savedTextSize = localStorage.getItem("large_text") === "true";
    if (savedTextSize) {
      document.documentElement.style.fontSize = "18px";
    }

    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setNickname(user.user_metadata?.nickname || user.email?.split('@')[0] || "");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setNickname(u.user_metadata?.nickname || u.email?.split('@')[0] || "");
      }
    });

    const timer = setTimeout(() => {
      setIsLargeText(savedTextSize);
    }, 0);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const toggleTextSize = () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    localStorage.setItem("large_text", String(newVal));
    document.documentElement.style.fontSize = newVal ? "18px" : "16px";
  };

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || nicknameSaving) return;

    setNicknameSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { nickname: nickname.trim() }
    });

    if (!error) {
      setIsEditingNickname(false);
      setSuccessMsg("ニックネームを保存しました");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    setNicknameSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-all cursor-pointer flex items-center justify-center"
        aria-label="設定"
      >
        <Settings size={18} />
      </button>

      {mounted && typeof document !== "undefined" && createPortal(
        <>
          {isOpen && (
            <div 
              className="fixed inset-0 bg-stone-900/30 z-50 transition-opacity animate-fade-in backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-stone-50 shadow-xl z-50 transform transition-all duration-300 ease-out flex flex-col border-l border-stone-200 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none invisible"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-white border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-800">
                <Settings className="text-primary" size={20} />
                <h2 className="font-bold text-base">メニュー & 設定</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              
              {/* Account Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">アカウント</h3>
                
                {user ? (
                  <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col gap-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {user.user_metadata?.nickname?.[0] || 'パ'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-stone-800 truncate">
                            {user.user_metadata?.nickname || user.email?.split('@')[0] || '家族メンバー'}
                          </h4>
                          <p className="text-xs text-stone-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditingNickname(!isEditingNickname)}
                        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                        title="名前を変更"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>

                    {isEditingNickname && (
                      <form onSubmit={handleUpdateNickname} className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                        <label className="text-xs font-medium text-stone-600">表示ニックネーム</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="ニックネームを入力"
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-primary"
                            maxLength={30}
                            required
                          />
                          <button
                            type="submit"
                            disabled={nicknameSaving}
                            className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </form>
                    )}

                    {successMsg && (
                      <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5 border border-emerald-100">
                        <Check size={14} /> {successMsg}
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                      <Link
                        href="/mypage"
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>マイページ（投稿・取引履歴）</span>
                        <ChevronRight size={14} className="text-stone-400" />
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="py-2 px-3 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} /> ログアウト
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col gap-3 text-center shadow-2xs">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      ログインすると、知恵袋への投稿や回答、おすすめアイテムの紹介、お譲りへの応募ができるようになります。
                    </p>
                    <a
                      href={`/login?next=${encodeURIComponent(currentPath)}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <LogIn size={14} /> ログイン / 新規登録
                    </a>
                  </div>
                )}
              </div>

              {/* Display Settings */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">アクセシビリティ</h3>
                <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="font-bold text-sm text-stone-800">文字サイズ拡大</h4>
                    <p className="text-xs text-stone-400 mt-0.5">画面全体の文字を大きく読みやすくします</p>
                  </div>
                  <button
                    onClick={toggleTextSize}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      isLargeText ? "bg-primary" : "bg-stone-200"
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                      isLargeText ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* App links */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">リンク</h3>
                <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                  <a 
                    href="https://plyo.blog" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3.5 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <span>plyo.blog（子育て専門メディア）</span>
                    <ChevronRight size={14} className="text-stone-400" />
                  </a>
                  <Link
                    href="/games"
                    onClick={() => setIsOpen(false)}
                    className="p-3.5 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <span>子供とあそぶ知育ゲーム一覧</span>
                    <ChevronRight size={14} className="text-stone-400" />
                  </Link>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-auto pt-6 border-t border-stone-200 text-center flex flex-col gap-1 text-[11px] text-stone-400 font-medium">
                <span>family-hug v1.1.0</span>
                <span>&copy; {new Date().getFullYear()} plyo.blog</span>
              </div>

            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
