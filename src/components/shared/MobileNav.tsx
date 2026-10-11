'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Star, Gamepad2, Gift } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'ホーム', href: '/', icon: Home },
    { label: '知恵袋', href: '/qa', icon: MessageCircle },
    { label: 'お譲り', href: '/gifts', icon: Gift },
    { label: 'アイテム', href: '/items', icon: Star },
    { label: 'あそぶ', href: '/games', icon: Gamepad2 },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 flex justify-around items-stretch z-40 h-16 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              isActive 
                ? 'text-primary' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Icon 
              size={20} 
              className={`transition-transform ${
                isActive 
                  ? 'stroke-[2.2px] scale-105' 
                  : 'stroke-[1.8px]'
              }`} 
            />
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium text-stone-500'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
