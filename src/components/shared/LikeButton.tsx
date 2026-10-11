'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleQuestionLike, toggleItemLike } from '@/app/actions/likes'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  targetId: string
  type: 'question' | 'item'
  initialLikes: number
  initialIsLiked?: boolean
  label?: string
  className?: string
  size?: number
}

export default function LikeButton({
  targetId,
  type,
  initialLikes,
  initialIsLiked = false,
  label = 'いいね',
  className = '',
  size = 16,
}: LikeButtonProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return

    // Optimistic update
    const prevLikes = likes
    const prevIsLiked = isLiked
    const nextIsLiked = !isLiked
    const nextLikes = nextIsLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1)

    setIsLiked(nextIsLiked)
    setLikes(nextLikes)
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = type === 'question' 
        ? await toggleQuestionLike(targetId)
        : await toggleItemLike(targetId)

      if (res.requireLogin) {
        // Rollback
        setIsLiked(prevIsLiked)
        setLikes(prevLikes)
        if (confirm('いいねをするにはログインが必要です。ログインページへ移動しますか？')) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
        }
        return
      }

      if (!res.success) {
        setIsLiked(prevIsLiked)
        setLikes(prevLikes)
        setErrorMessage(res.message || '更新に失敗しました')
      } else {
        if (res.likesCount !== undefined) {
          setLikes(res.likesCount)
        }
        if (res.isLiked !== undefined) {
          setIsLiked(res.isLiked)
        }
      }
    } catch {
      setIsLiked(prevIsLiked)
      setLikes(prevLikes)
      setErrorMessage('通信エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 transition-all cursor-pointer font-bold select-none ${
          isLiked
            ? 'text-primary bg-primary-light/80 border-primary/30'
            : 'text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border-stone-200'
        } ${className}`}
        aria-label={`${label} (${likes})`}
      >
        <Heart 
          size={size} 
          className={`transition-transform duration-200 ${
            isLiked 
              ? 'fill-primary text-primary scale-110' 
              : 'text-stone-400 group-hover:text-stone-600'
          }`} 
        />
        <span>{label}</span>
        <span className="font-semibold text-xs ml-0.5">{likes}</span>
      </button>

      {errorMessage && (
        <span className="text-[10px] text-red-500 font-bold mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  )
}
