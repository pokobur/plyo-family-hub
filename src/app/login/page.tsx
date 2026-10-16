'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getSafeRedirectPath } from '@/lib/constants'

function LoginForm() {
  const searchParams = useSearchParams()
  const nextRedirect = getSafeRedirectPath(searchParams.get('next'), '/')

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createClient()

  // Reset errors/success states when changing tabs
  useEffect(() => {
    setError(null)
    setSuccessMessage(null)
  }, [activeTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      window.location.href = nextRedirect
    } catch (err: any) {
      setError(err.message || 'ログイン中にエラーが発生しました。')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (!nickname.trim()) {
      setError('ニックネームを入力してください。')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRedirect)}`,
          data: {
            nickname: nickname.trim(),
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        window.location.href = nextRedirect
      } else {
        setSuccessMessage(
          '確認用のメールを送信しました！記載されたリンクをクリックして本登録を完了してください。'
        )
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || '新規登録中にエラーが発生しました。')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            {activeTab === 'login' ? 'メンバーログイン' : '新規ファミリー登録'}
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1.5 leading-relaxed">
            {activeTab === 'login' 
              ? '知恵袋への質問・回答や、おすすめアイテム・お譲りの投稿にはログインが必要です。' 
              : 'family-hug（ファミリーハグ）に登録して、みんなと子育てを支え合いましょう！'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-xl border border-stone-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn size={15} className={activeTab === 'login' ? 'text-primary' : ''} />
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus size={15} className={activeTab === 'signup' ? 'text-primary' : ''} />
            新規登録
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <div>
              <p className="text-sm font-bold">{successMessage}</p>
              <p className="text-xs font-medium text-emerald-700/80 mt-2 leading-relaxed">
                ※メールが届かない場合は、迷惑メールフォルダをご確認いただくか、入力したメールアドレスが正しいか再度お確かめください。
              </p>
            </div>
          </div>
        ) : (
          /* Form Area */
          <form 
            onSubmit={activeTab === 'login' ? handleLogin : handleSignUp} 
            className="flex flex-col gap-4"
            autoComplete="off"
          >
            
            {activeTab === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-700">ニックネーム (投稿者名)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="例: たろうパパ、はなママ"
                    autoComplete="off"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 text-sm outline-none focus:bg-white focus:border-primary transition-all font-medium"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">メールアドレス</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 text-sm outline-none focus:bg-white focus:border-primary transition-all font-medium"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">パスワード（6文字以上）</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-800 text-sm outline-none focus:bg-white focus:border-primary transition-all font-medium"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  処理中...
                </>
              ) : activeTab === 'login' ? (
                'ログインする'
              ) : (
                '新規アカウント作成'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 py-4">
      <Link href="/" className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors w-fit font-bold">
        <ArrowLeft size={15} /> トップページに戻る
      </Link>

      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
