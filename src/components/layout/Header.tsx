'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, HeartHandshake, MessageCircleQuestion } from "lucide-react";
import SettingsButton from "./SettingsButton";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="group-hover:rotate-12 transition-transform shrink-0">
            <img 
              src="/logo.jpg" 
              alt="plyo. family hug" 
              className="w-8 h-8 rounded-xl object-cover border border-gray-100 shadow-xs" 
            />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground">
            plyo. <span className="text-primary">family hug</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-bold text-sm text-gray-600">
          <Link href="/qa" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <MessageCircleQuestion size={18} />
            <span>子育て知恵袋</span>
          </Link>
          <Link href="/items" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <HeartHandshake size={18} />
            <span>おすすめアイテム</span>
          </Link>
          <Link href="/games" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Gamepad2 size={18} />
            <span>子供とあそぶ</span>
          </Link>
        </nav>

        {/* Right Actions & External Link */}
        <div className="flex items-center gap-4">
          <a 
            href="https://plyo.blog" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 font-bold rounded-full text-xs items-center gap-1 border border-indigo-100 hover-lift"
          >
            📚 子育て記事を読む
          </a>
          <SettingsButton />
        </div>
      </div>

      {/* Mobile Navigation at the top */}
      <div className="md:hidden flex items-center justify-around border-t border-gray-100/60 bg-white/60 py-2.5 px-2 text-xs font-bold text-gray-500">
        <Link 
          href="/" 
          className={`hover:text-primary transition-colors py-1 px-3 rounded-lg ${
            pathname === '/' ? 'text-primary bg-primary/10' : ''
          }`}
        >
          ホーム
        </Link>
        <Link 
          href="/qa" 
          className={`hover:text-primary transition-colors py-1 px-3 rounded-lg ${
            pathname.startsWith('/qa') ? 'text-primary bg-primary/10' : ''
          }`}
        >
          知恵袋
        </Link>
        <Link 
          href="/items" 
          className={`hover:text-primary transition-colors py-1 px-3 rounded-lg ${
            pathname.startsWith('/items') ? 'text-primary bg-primary/10' : ''
          }`}
        >
          アイテム
        </Link>
        <Link 
          href="/games" 
          className={`hover:text-primary transition-colors py-1 px-3 rounded-lg ${
            pathname.startsWith('/games') ? 'text-primary bg-primary/10' : ''
          }`}
        >
          あそぶ
        </Link>
      </div>
    </header>
  );
}
