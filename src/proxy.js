import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  if (user) {
    // Veritabanından admin yetkisi var mı bakıyoruz
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    // 1. Admin ise ve / (Login) veya /dashboard'a gitmeye çalışıyorsa -> /admin'e fırlat
    if (isAdmin && (url.pathname === '/' || url.pathname === '/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // 2. Normal kullanıcı ise ve /admin'e sızmaya çalışıyorsa -> /dashboard'a fırlat
    if (!isAdmin && url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. Normal kullanıcı giriş yapmış ve / (Login) sayfasındaysa -> /dashboard'a fırlat
    if (!isAdmin && url.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    // GİRİŞ YAPILMAMIŞSA: Dashboard veya Admin sayfalarına erişimi engelle -> Login'e (/) fırlat
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar dışındaki her şeyi yakala:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico (ikon)
     * - Uzantısı olan dosyalar (svg, png, jpg vb.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}