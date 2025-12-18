import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Kullanıcı bilgisini çekiyoruz
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // --- YÖNLENDİRME MANTIĞI ---
  
  // 1. Eğer kullanıcı giriş yapmışsa VE ana sayfadaysa ('/'), dashboard'a gönder:
  if (user && url.pathname === '/') {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 2. Eğer kullanıcı giriş YAPMAMIŞSA ve dashboard'a girmeye çalışıyorsa, ana sayfaya (veya login'e) gönder:
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/' // Burayı '/login' olarak da değiştirebilirsin
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}