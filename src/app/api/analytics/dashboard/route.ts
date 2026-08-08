// src/app/api/analytics/dashboard/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('get_dashboard', { p_user_id: user.id })

  if (error) {
    console.error('[dashboard] RPC error:', error)
    return NextResponse.json({ error: 'DASHBOARD_FAILED' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...data }, { status: 200 })
}