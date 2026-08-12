import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const { user } = await getAuthContext(request)

  if (!user) {
    return NextResponse.json(
      {
        error: 'UNAUTHENTICATED',
        route_version: 'dashboard-v2',
        has_auth_header: !!authHeader,
      },
      { status: 401 }
    )
  }

  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_dashboard', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('[dashboard] RPC error:', error)

    return NextResponse.json(
      {
        error: 'DASHBOARD_FAILED',
        route_version: 'dashboard-v2',
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      route_version: 'dashboard-v2',
      ...(data ?? {}),
    },
    { status: 200 }
  )
}