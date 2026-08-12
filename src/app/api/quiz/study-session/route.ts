// src/app/api/quiz/study-session/route.ts

import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  toClientQuestion,
  type DbQuestion,
} from '@/lib/serializers'

export async function GET(request: Request) {
  // =====================================================
  // AUTH
  // Mendukung:
  // - Bearer Token dari Postman/mobile/API eksternal
  // - Cookie dari website Next.js
  // =====================================================
  const { user } = await getAuthContext(request)

  if (!user) {
    return NextResponse.json(
      {
        error: 'UNAUTHENTICATED',
      },
      {
        status: 401,
      }
    )
  }

  // =====================================================
  // QUERY PARAMETER
  //
  // Contoh:
  // /api/quiz/study-session
  // /api/quiz/study-session?limit=5
  //
  // Default 10, minimum 1, maksimum 50.
  // =====================================================
  const { searchParams } = new URL(request.url)

  const rawLimit = Number(
    searchParams.get('limit') ?? 10
  )

  const limit = Number.isFinite(rawLimit)
    ? Math.min(
        50,
        Math.max(
          1,
          Math.trunc(rawLimit)
        )
      )
    : 10

  // =====================================================
  // AMBIL STUDY SESSION VIA RPC
  //
  // RPC bertanggung jawab terhadap:
  // - pemilihan soal user
  // - filter next_review_date
  // - weighted random selection
  // - limit jumlah soal
  //
  // Admin client dipakai karena RPC menjalankan logic
  // server-side, tetapi user ID TIDAK berasal dari client.
  // user.id berasal dari JWT/cookie yang sudah divalidasi.
  // =====================================================
  const admin = createAdminClient()

  const {
    data: questions,
    error,
  } = await admin.rpc(
    'get_study_session',
    {
      p_user_id: user.id,
      p_limit: limit,
    }
  )

  if (error) {
    console.error(
      '[study-session] RPC error:',
      error
    )

    return NextResponse.json(
      {
        error: 'SESSION_FAILED',
      },
      {
        status: 500,
      }
    )
  }

  // =====================================================
  // SECURITY / EGRESS SANITIZATION
  //
  // correct_answer boleh tetap ada di database
  // untuk grading server-side.
  //
  // Tetapi correct_answer TIDAK BOLEH keluar
  // ke browser, Postman, mobile, atau client lain.
  // =====================================================
  const persistedQuestions =
    (questions ?? []) as DbQuestion[]

  const safeQuestions =
    persistedQuestions.map(
      toClientQuestion
    )

  // =====================================================
  // SUCCESS
  // =====================================================
  return NextResponse.json(
    {
      ok: true,
      count: safeQuestions.length,
      questions: safeQuestions,
    },
    {
      status: 200,
    }
  )
}