'use client'

import { useState, useEffect } from "react";
import { Settings, X, Shield, Check, Trash2, Key, User as UserIcon, LogIn, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [pin, setPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinMessage, setPinMessage] = useState("");
  const [pinError, setPinError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("/");

  // Hydration safety: only read from localStorage / document on client
  useEffect(() => {
    // Read text size setting
    const savedTextSize = localStorage.getItem("large_text") === "true";
    if (savedTextSize) {
      document.documentElement.style.fontSize = "18px";
    }

    // Read PIN setting
    const savedPin = localStorage.getItem("parental_pin") || "";

    // Set current path for login redirect
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }

    // Get initial auth session and listen to changes
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Defer state updates to avoid React 19 cascading renders lint warning
    const timer = setTimeout(() => {
      setIsLargeText(savedTextSize);
      setPin(savedPin);
    }, 0);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Handle Text Size Toggle
  const toggleTextSize = () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    localStorage.setItem("large_text", String(newVal));
    document.documentElement.style.fontSize = newVal ? "18px" : "16px";
  };

  // Handle PIN Setting
  const handleSetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.length !== 4 || !/^\d+$/.test(inputPin)) {
      setPinError("4桁の数字を入力してください");
      return;
    }
    if (inputPin !== confirmPin) {
      setPinError("PINコードが一致しません");
      return;
    }

    localStorage.setItem("parental_pin", inputPin);
    setPin(inputPin);
    setIsSettingPin(false);
    setInputPin("");
    setConfirmPin("");
    setPinError("");
    setPinMessage("PINコードを設定しました");
    setTimeout(() => setPinMessage(""), 3000);
  };

  // Handle PIN Removal
  const handleRemovePin = () => {
    const verify = prompt("現在の4桁のPINコードを入力してください:");
    if (verify === pin) {
      localStorage.removeItem("parental_pin");
      setPin("");
      setPinMessage("PINコードを解除しました");
      setTimeout(() => setPinMessage(""), 3000);
    } else if (verify !== null) {
      alert("PINコードが正しくありません");
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      {/* Settings Gear Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-primary bg-gray-100 hover:bg-gray-200 rounded-full transition-all hover:rotate-45"
        aria-label="設定"
      >
        <Settings size={20} />
      </button>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 transition-opacity animate-fade-in backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Settings Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="text-primary animate-spin-slow" size={22} />
            <h2 className="font-black text-lg text-gray-800">設定メニュー</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {/* Section 1: User Account */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">アカウント</h3>
            {user ? (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl shrink-0">
                    <UserIcon size={20} className="fill-primary/10" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">
                      {user.user_metadata?.nickname || user.email?.split('@')[0] || 'ファミリーメンバー'}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-red-100 transition-colors cursor-pointer"
                >
                  <LogOut size={14} /> ログアウト
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3 text-center">
                <p className="text-xs text-gray-500 font-bold">
                  ログインすると、知恵袋の投稿やおすすめアイテムのシェアができます。
                </p>
                <a
                  href={`/login?next=${encodeURIComponent(currentPath)}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <LogIn size={14} /> ログイン / 新規登録
                </a>
              </div>
            )}
          </div>

          {/* Section 2: Display Settings */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">表示設定</h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-800">文字サイズ（拡大）</h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">アプリ全体の文字を大きく表示します</p>
              </div>
              <button
                onClick={toggleTextSize}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  isLargeText ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  isLargeText ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          {/* Section 3: Parental Control PIN */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ペアレンタルコントロール</h3>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl mt-0.5">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">保護者向け暗証番号（PIN）</h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">子供用ゲームのロック解除や設定保護に利用します</p>
                </div>
              </div>

              {pinMessage && (
                <div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl border border-green-100 flex items-center gap-1.5">
                  <Check size={14} /> {pinMessage}
                </div>
              )}

              {/* Setting flow / Status */}
              {pin ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span className="flex items-center gap-1"><Key size={14} className="text-green-500" /> PINコード有効</span>
                    <span>****</span>
                  </div>
                  <button
                    onClick={handleRemovePin}
                    className="w-full mt-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-red-100 transition-colors"
                  >
                    <Trash2 size={14} /> PINコードを解除する
                  </button>
                </div>
              ) : isSettingPin ? (
                <form onSubmit={handleSetPinSubmit} className="flex flex-col gap-3 pt-2 border-t border-gray-200/50">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600">新しい4桁 of PINを入力</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="数字4桁"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono text-center tracking-widest"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600">PINの確認</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="もう一度入力"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono text-center tracking-widest"
                      required
                    />
                  </div>
                  {pinError && <p className="text-red-500 text-xs font-bold">{pinError}</p>}
                  
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingPin(false);
                        setPinError("");
                        setInputPin("");
                        setConfirmPin("");
                      }}
                      className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                      設定する
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsSettingPin(true)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl border border-blue-100 transition-colors"
                >
                  PINコードを設定する
                </button>
              )}
            </div>
          </div>

          {/* Section 4: App info */}
          <div className="mt-auto pt-6 border-t border-gray-100 text-center flex flex-col gap-1 text-[11px] text-gray-400 font-medium">
            <span>plyo. family hub v1.0.0</span>
            <span>&copy; {new Date().getFullYear()} plyo.blog</span>
          </div>

        </div>
      </div>
    </>
  );
}
