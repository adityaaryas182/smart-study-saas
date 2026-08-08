import { createClient } from '@supabase/supabase-js'

// ⚠️ SERVER-ONLY. JANGAN pernah import file ini di kode client.
// Service role mem-bypass RLS — kebocoran ke browser = lubang keamanan fatal.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}