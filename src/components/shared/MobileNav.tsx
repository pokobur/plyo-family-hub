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
    <nav className="md:hidden fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-4 right-4 max-w-md mx-auto bg-white/95 backdrop-blur-md border border-gray-200/60 flex justify-around items-stretch z-40 h-14 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 cursor-pointer ${
              isActive 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon 
              size={20} 
              className={`transition-all duration-200 ${
                isActive 
                  ? 'stroke-[2.5px] scale-105' 
                  : 'stroke-[2px]'
              }`} 
            />
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
