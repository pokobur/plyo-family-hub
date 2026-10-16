import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeRedirectPath } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'), '/')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(new URL(next, request.url))
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(new URL(next, request.url))
      }
    }
  }

  // Return the user to home page if code exchange fails
  return NextResponse.redirect(new URL('/', request.url))
}
