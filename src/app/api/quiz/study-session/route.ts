// src/app/api/quiz/study-session/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  // Ambil limit dari query (?limit=10), default 10, dibatasi 1..50.
  const { searchParams } = new URL(request.url)
  const rawLimit = Number(searchParams.get('limit') ?? 10)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.trunc(rawLimit)))
    : 10

  const admin = createAdminClient()
  const { data: questions, error } = await admin.rpc('get_study_session', {
    p_user_id: user.id,
    p_limit: limit,
  })

  if (error) {
    console.error('[study-session] RPC error:', error)
    return NextResponse.json({ error: 'SESSION_FAILED' }, { status: 500 })
  }

  return NextResponse.json(
    { ok: true, count: questions?.length ?? 0, questions },
    { status: 200 }
  )
}