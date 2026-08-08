// src/app/api/quiz/submit-answer/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Client kirim OPSI yang dipilih, bukan quality_score. Server yang menilai.
const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid(),
  user_answer: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
  const { question_id, user_answer } = parsed.data

  const admin = createAdminClient()

  // 1) Ambil correct_answer di server untuk penilaian (tak pernah dikirim ke client).
  const { data: q, error: qErr } = await admin
    .from('questions')
    .select('correct_answer')
    .eq('id', question_id)
    .single()
  if (qErr || !q) {
    return NextResponse.json({ error: 'QUESTION_NOT_FOUND' }, { status: 404 })
  }

  // 2) Penilaian server-side + turunkan quality_score untuk SM-2.
  const isCorrect = user_answer === q.correct_answer
  const qualityScore = isCorrect ? 5 : 2 // v1: benar=5, salah=2

  // 3) Jalankan SM-2 via RPC yang sudah ada (RPC juga verifikasi kepemilikan soal).
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

  // 4) Kembalikan feedback: benar/salah + kunci jawaban (baru boleh muncul SETELAH menjawab).
  return NextResponse.json(
    { ok: true, is_correct: isCorrect, correct_answer: q.correct_answer, progress },
    { status: 200 }
  )
}