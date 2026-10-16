'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, HeartHandshake, MessageCircleQuestion, Gift, ExternalLink } from "lucide-react";
import SettingsButton from "./SettingsButton";
import { EXTERNAL_LINKS } from "@/lib/constants";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "子育て知恵袋", href: "/qa", icon: MessageCircleQuestion, external: false },
    { label: "おすすめアイテム", href: "/items", icon: HeartHandshake, external: false },
    { label: "お譲りボード", href: "/gifts", icon: Gift, external: false },
    { label: "子供とあそぶ", href: EXTERNAL_LINKS.GAMES_PORTAL, icon: Gamepad2, external: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="shrink-0 transition-transform group-hover:scale-105">
            <img 
              src="/logo.jpg" 
              alt="family-hug" 
              className="w-9 h-9 rounded-xl object-cover border border-stone-200 shadow-2xs" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-stone-900 leading-none">
              family<span className="text-primary">-hug</span>
            </span>
            <span className="text-[10px] text-stone-600 font-medium tracking-wider mt-0.5">
              ファミリーハグ
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 font-bold text-sm text-stone-600">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.external && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium"
                >
                  <Icon size={17} className="text-stone-400" />
                  <span>{item.label}</span>
                  <ExternalLink size={12} className="text-stone-400" />
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-bold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium"
                }`}
              >
                <Icon size={17} className={isActive ? "text-primary" : "text-stone-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & External Link */}
        <div className="flex items-center gap-3">
          <a 
            href={EXTERNAL_LINKS.BLOG} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200/70 text-stone-700 font-bold rounded-lg text-xs items-center gap-1.5 border border-stone-200 transition-colors"
          >
            <span>plyo.blog 記事</span>
            <span className="text-stone-400 text-[10px]">↗</span>
          </a>
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
