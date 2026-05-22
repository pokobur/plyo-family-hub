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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 flex justify-around items-stretch z-40 h-[calc(56px+env(safe-area-inset-bottom,12px))] pb-[env(safe-area-inset-bottom,12px)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
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
