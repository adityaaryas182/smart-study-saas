// src/app/api/quiz/submit-answer/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid(),
  user_answer: z.string().min(1),
  // Rating user saat jawaban benar: 3=Susah, 4=Sedang, 5=Mudah.
  // Optional; kalau tak dikirim, default 4 (Sedang) untuk jawaban benar.
  quality_rating: z.number().int().min(3).max(5).optional(),
})

export async function POST(request: Request) {
  // Menggunakan helper autentikasi terpusat yang membaca dari Header (Postman) / Cookie (Web)
  const { user } = await getAuthContext(request)
  
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON_BODY' }, { status: 400 })
  }
  
  const parsed = SubmitAnswerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { question_id, user_answer, quality_rating } = parsed.data

  const admin = createAdminClient()

  // 1) Ambil correct_answer di server untuk verifikasi (tak dikirim ke client).
  const { data: q, error: qErr } = await admin
    .from('questions')
    .select('correct_answer')
    .eq('id', question_id)
    .single()
    
  if (qErr || !q) {
    return NextResponse.json({ error: 'QUESTION_NOT_FOUND' }, { status: 404 })
  }

  const isCorrect = user_answer === q.correct_answer

  // 2) Tentukan quality_score:
  //    - Salah  -> selalu 2 (lapse). Rating user diabaikan (anti-curang).
  //    - Benar  -> pakai rating user (3/4/5), default 4 kalau tak ada.
  const qualityScore = isCorrect ? (quality_rating ?? 4) : 2

  // 3) Jalankan SM-2 via RPC yang sudah ada.
  const { data: progress, error: rpcErr } = await admin.rpc('submit_answer', {
    p_user_id: user.id,
    p_question_id: question_id,
    p_quality_score: qualityScore,
  })
  
  if (rpcErr) {
    const msg = rpcErr.message || ''
    if (msg.includes('QUESTION_FORBIDDEN') || msg.includes('QUESTION_NOT_FOUND')) {
      return NextResponse.json({ error: 'QUESTION_FORBIDDEN' }, { status: 403 })
    }
    console.error('[submit-answer] RPC error:', rpcErr)
    return NextResponse.json({ error: 'SUBMIT_FAILED' }, { status: 500 })
  }

  return NextResponse.json(
    { ok: true, is_correct: isCorrect, correct_answer: q.correct_answer, progress },
    { status: 200 }
  )
}