// src/lib/auth.ts

import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function getAuthContext(request: Request) {
  const authHeader = request.headers.get('authorization')

  // =====================================================
  // 1. Bearer Token
  // Untuk Postman / mobile / external API
  // =====================================================
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()

    if (!token) {
      return {
        user: null,
        supabase: null,
      }
    }

    const supabase = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Validasi JWT user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        user: null,
        supabase: null,
      }
    }

    return {
      user,
      supabase,
    }
  }

  // =====================================================
  // 2. Cookie / SSR
  // Untuk request dari website Next.js
  // =====================================================
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      supabase: null,
    }
  }

  return {
    user,
    supabase,
  }
}