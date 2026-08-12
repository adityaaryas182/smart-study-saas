// src/app/api/quiz/submit-answer/route.ts

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// =====================================================
// SCHEMA
//
// Client hanya mengirim:
// - question_id
// - selected_index
// - quality_rating (opsional)
//
// Client TIDAK mengirim is_correct.
// Server menentukan benar/salah sendiri.
// =====================================================
const SubmitAnswerSchema = z.object({
  question_id: z.string().uuid(),

  // Index pilihan user:
  // 0 = opsi pertama
  // 1 = opsi kedua
  // 2 = opsi ketiga
  // 3 = opsi keempat
  selected_index: z
    .number()
    .int()
    .min(0)
    .max(3),

  // Self-assessment jika jawaban benar:
  // 3 = Susah
  // 4 = Sedang
  // 5 = Mudah
  //
  // Jika jawaban salah, nilai ini diabaikan
  // dan quality_score dipaksa menjadi 2.
  quality_rating: z
    .number()
    .int()
    .min(3)
    .max(5)
    .optional(),
})

export async function POST(request: Request) {
  // =====================================================
  // 1. AUTH
  //
  // Mendukung:
  // - Bearer Token dari Postman/mobile
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
  // 2. PARSE REQUEST BODY
  // =====================================================
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        error: 'INVALID_JSON_BODY',
      },
      {
        status: 400,
      }
    )
  }

  // =====================================================
  // 3. VALIDASI REQUEST
  // =====================================================
  const parsed = SubmitAnswerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'INVALID_REQUEST',
        details: parsed.error.flatten(),
      },
      {
        status: 400,
      }
    )
  }

  const {
    question_id,
    selected_index,
    quality_rating,
  } = parsed.data

  // =====================================================
  // 4. ADMIN CLIENT
  //
  // Digunakan untuk membaca jawaban benar dan
  // menjalankan RPC SM-2 server-side.
  // =====================================================
  const admin = createAdminClient()

  // =====================================================
  // 5. AMBIL DATA JAWABAN BENAR
  //
  // correct_index TIDAK berasal dari client.
  // correct_answer hanya dipakai sebagai feedback
  // setelah grading selesai.
  // =====================================================
  const {
    data: question,
    error: questionError,
  } = await admin
    .from('questions')
    .select(
      'correct_index, correct_answer'
    )
    .eq('id', question_id)
    .single()

  if (questionError || !question) {
    return NextResponse.json(
      {
        error: 'QUESTION_NOT_FOUND',
      },
      {
        status: 404,
      }
    )
  }

  // =====================================================
  // 6. GUARD: QUESTION HARUS PUNYA correct_index
  //
  // Ini melindungi dari data lama / data rusak
  // yang belum memiliki correct_index.
  // =====================================================
  if (
    question.correct_index === null ||
    question.correct_index === undefined
  ) {
    return NextResponse.json(
      {
        error: 'QUESTION_NOT_GRADABLE',
      },
      {
        status: 409,
      }
    )
  }

  // =====================================================
  // 7. GRADING SERVER-SIDE
  //
  // User hanya mengirim selected_index.
  // Server sendiri membandingkan dengan correct_index.
  // =====================================================
  const isCorrect =
    selected_index === question.correct_index

  // =====================================================
  // 8. TENTUKAN QUALITY SCORE
  //
  // SALAH:
  //   selalu quality = 2
  //   -> lapse
  //
  // BENAR:
  //   3 = Susah
  //   4 = Sedang
  //   5 = Mudah
  //
  // Default benar = 4
  // =====================================================
  const qualityScore = isCorrect
    ? (quality_rating ?? 4)
    : 2

  // =====================================================
  // 9. UPDATE PROGRESS VIA SM-2
  // =====================================================
  const {
    data: progress,
    error: rpcError,
  } = await admin.rpc(
    'submit_answer',
    {
      p_user_id: user.id,
      p_question_id: question_id,
      p_quality_score: qualityScore,
    }
  )

  if (rpcError) {
    const message =
      rpcError.message || ''

    // Question tidak dimiliki user atau tidak ditemukan
    if (
      message.includes(
        'QUESTION_FORBIDDEN'
      ) ||
      message.includes(
        'QUESTION_NOT_FOUND'
      )
    ) {
      return NextResponse.json(
        {
          error: 'QUESTION_FORBIDDEN',
        },
        {
          status: 403,
        }
      )
    }

    console.error(
      '[submit-answer] RPC error:',
      rpcError
    )

    return NextResponse.json(
      {
        error: 'SUBMIT_FAILED',
      },
      {
        status: 500,
      }
    )
  }

  // =====================================================
  // 10. SUCCESS RESPONSE
  //
  // correct_answer boleh dikembalikan SETELAH user
  // submit sebagai feedback.
  //
  // correct_index TIDAK dikirim ke client.
  // =====================================================
  return NextResponse.json(
    {
      ok: true,
      is_correct: isCorrect,
      correct_answer:
        question.correct_answer,
      progress,
    },
    {
      status: 200,
    }
  )
}