// src/app/api/quiz/submit-answer/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// =====================================================
// SCHEMA
// Grading berbasis INDEX, bukan teks.
// - selected_index: posisi jawaban yang dipilih user (0-3).
// - quality_rating: self-assessment saat jawaban benar (3/4/5).
//   Diabaikan saat jawaban salah (anti-curang).
// =====================================================
const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_index: z.number().int().min(0).max(3),
  quality_rating: z.number().int().min(3).max(5).optional(),
})

export async function POST(request: Request) {
  // =====================================================
  // AUTH
  // Helper terpusat: membaca Bearer (Postman/mobile) atau Cookie (web).
  // =====================================================
  const { user } = await getAuthContext(request)

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  // =====================================================
  // PARSE BODY
  // =====================================================
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

  const { question_id, selected_index, quality_rating } = parsed.data

  const admin = createAdminClient()

  // =====================================================
  // 1) AMBIL JAWABAN BENAR DI SERVER
  // Ambil correct_index untuk grading, dan correct_answer
  // (teks) untuk ditampilkan sebagai pembahasan setelah submit.
  // Keduanya TIDAK dikirim ke client sebelum user menjawab.
  // =====================================================
  const { data: q, error: qErr } = await admin
    .from('questions')
    .select('correct_index, correct_answer')
    .eq('id', question_id)
    .single()

  if (qErr || !q) {
    return NextResponse.json({ error: 'QUESTION_NOT_FOUND' }, { status: 404 })
  }

  // Guard: soal ada tapi belum punya index (data lama tak ter-backfill /
  // pipeline belum lengkap). Dibedakan dari NOT_FOUND agar mudah didebug.
  if (q.correct_index === null || q.correct_index === undefined) {
    return NextResponse.json({ error: 'QUESTION_NOT_GRADABLE' }, { status: 409 })
  }

  // =====================================================
  // 2) GRADING SERVER-SIDE (berbasis index)
  // Bandingkan angka, bukan teks -> bebas dari bug string match.
  // =====================================================
  const isCorrect = selected_index === q.correct_index

  // =====================================================
  // 3) TENTUKAN QUALITY SCORE
  //    - Salah -> selalu 2 (lapse). Rating user diabaikan (anti-curang).
  //    - Benar -> pakai rating user (3/4/5), default 4 (Sedang) kalau tak ada.
  // =====================================================
  const qualityScore = isCorrect ? (quality_rating ?? 4) : 2

  // =====================================================
  // 4) JALANKAN SM-2 VIA RPC
  // =====================================================
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

  // =====================================================
  // 5) RESPONSE
  // correct_answer + correct_index dikembalikan SETELAH submit
  // sebagai pembahasan instan. Ini keputusan sadar (instant feedback);
  // aman karena jawaban salah tetap dihukum di SM-2.
  // =====================================================
  return NextResponse.json(
    {
      ok: true,
      is_correct: isCorrect,
      correct_index: q.correct_index,
      correct_answer: q.correct_answer,
      progress,
    },
    { status: 200 }
  )
}