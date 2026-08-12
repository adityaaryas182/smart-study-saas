// src/lib/auth.ts

import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function getAuthContext(request: Request) {
  const authHeader = request.headers.get('authorization')

  // =====================================================
  // 1. Bearer Token
  // Postman / mobile / external API
  // =====================================================
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()

    if (!token) {
      return {
        user: null,
        supabase: null,
      }
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        '[auth] Supabase URL/key environment variable tidak ditemukan'
      )

      return {
        user: null,
        supabase: null,
      }
    }

    const supabase = createSupabaseJsClient(
      supabaseUrl,
      supabaseKey,
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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error(
        '[auth] Bearer authentication gagal:',
        error?.message
      )

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
  // Website Next.js
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