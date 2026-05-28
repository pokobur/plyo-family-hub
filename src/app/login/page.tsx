'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextRedirect = searchParams.get('next') || '/'

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

      router.push(nextRedirect)
      router.refresh()
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

      // Check if session exists (i.e. email confirmation is disabled)
      if (data.session) {
        router.push(nextRedirect)
        router.refresh()
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
    <div className="max-w-md w-full mx-auto bg-white rounded-[2rem] border border-primary/20 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-[#ff9a8b]"></div>
      
      <div className="p-8 md:p-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-800">
            {activeTab === 'login' ? 'メンバーログイン' : '新規ファミリー登録'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1.5">
            {activeTab === 'login' 
              ? '知恵袋への回答や、おすすめアイテムの投稿にはログインが必要です。' 
              : 'Plyo Family Hugに登録して、みんなと子育てを支え合いましょう！'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-primary shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LogIn size={16} />
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-white text-primary shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserPlus size={16} />
            新規登録
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-100 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={36} className="text-green-500" />
            <div>
              <p className="text-sm font-bold">{successMessage}</p>
              <p className="text-xs font-medium text-green-700/80 mt-2">
                ※メールが届かない場合は、迷惑メールフォルダをご確認いただくか、入力したメールアドレスが正しいか再度お確かめください。
              </p>
            </div>
          </div>
        ) : (
          /* Form Area */
          <form onSubmit={activeTab === 'login' ? handleLogin : handleSignUp} className="flex flex-col gap-4">
            
            {activeTab === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">ニックネーム (投稿者名)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="例: たろうパパ、はなママ"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">メールアドレス</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">パスワード</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-4"
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
    <div className="flex flex-col gap-6 py-8">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold self-start">
        <ArrowLeft size={16} /> トップページに戻る
      </Link>

      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
