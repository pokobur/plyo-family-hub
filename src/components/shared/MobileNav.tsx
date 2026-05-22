'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Star, Gamepad2 } from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'ホーム', href: '/', icon: Home },
    { label: '知恵袋', href: '/qa', icon: MessageCircle },
    { label: 'アイテム', href: '/items', icon: Star },
    { label: 'あそぶ', href: '/games', icon: Gamepad2 },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex justify-around items-center z-40 px-2 pt-2 pb-5">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl gap-1.5 transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'text-primary scale-105 font-black' 
                : 'text-gray-400 font-bold hover:text-gray-600'
            }`}
          >
            <Icon 
              size={20} 
              className={`transition-all duration-300 ${
                isActive 
                  ? 'stroke-[2.5px] scale-110 drop-shadow-[0_2px_10px_rgba(255,107,107,0.35)]' 
                  : 'stroke-[2px]'
              }`} 
            />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
