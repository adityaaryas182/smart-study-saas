// lib/auth.ts
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Ambil user terautentikasi dari header Bearer ATAU cookie.
 * - Bearer: untuk Postman, mobile, API client eksternal.
 * - Cookie: untuk request dari browser (Next.js SSR) yang sudah ada.
 * Return null kalau dua-duanya gagal.
 */
export async function getAuthUser(request: Request) {
  // 1) Coba Bearer token dari header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    // getUser(token) memvalidasi JWT ke server Supabase -> aman, tak bisa dipalsukan
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return user
  }

  // 2) Fallback: baca session dari cookie (request dari browser)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // route handler read-only, tak perlu menulis cookie
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}