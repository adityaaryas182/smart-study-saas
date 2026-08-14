// src/app/api/generate-quiz/route.ts

import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { GenerateQuizRequestSchema } from '@/lib/validation'
import { generateQuizOnce } from '@/lib/gemini'
import {
  toClientQuestion,
  type DbQuestion,
} from '@/lib/serializers'

const MAX_ATTEMPTS = 3

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
  // =====================================================
  // AUTH
  // Mendukung:
  // - Bearer Token dari Postman / mobile / API eksternal
  // - Cookie dari website Next.js
  // =====================================================
  const { user, supabase } =
    await getAuthContext(request)

  if (!user || !supabase) {
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
  // VALIDASI BODY
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

  const parsed =
    GenerateQuizRequestSchema.safeParse(body)

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

  const { material_id, count } = parsed.data

  // =====================================================
  // AMBIL MATERIAL
  // Client membawa JWT/session user sehingga RLS tetap aktif
  // =====================================================
  const {
    data: material,
    error: materialError,
  } = await supabase
    .from('materials')
    .select('content')
    .eq('id', material_id)
    .single()

  if (materialError || !material) {
    return NextResponse.json(
      {
        error: 'MATERIAL_NOT_FOUND',
      },
      {
        status: 404,
      }
    )
  }

  // =====================================================
  // STEP 1: CEK CREDIT
  // Fast-fail sebelum memanggil AI
  // =====================================================
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      {
        error: 'USER_PROFILE_NOT_FOUND',
      },
      {
        status: 404,
      }
    )
  }

  if (profile.credits <= 0) {
    return NextResponse.json(
      {
        error: 'INSUFFICIENT_CREDITS',
      },
      {
        status: 402,
      }
    )
  }

  // =====================================================
  // STEP 2: GENERATE QUIZ
  //
  // Retry untuk error sementara.
  //
  // - 429:
  //   rate limit / quota exhausted.
  //   Stop langsung agar tidak membuang request tambahan.
  //
  // - 503:
  //   AI sedang overloaded/unavailable.
  //   Retry dengan exponential backoff.
  //
  // - Error lain:
  //   Termasuk JSON/Zod invalid.
  //   Tetap retry tanpa delay.
  // =====================================================
  let questions = null
  let lastError = ''
  let lastStatus: number | null = null

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      questions = await generateQuizOnce(
        material.content,
        count
      )

      // Sukses -> keluar dari retry loop
      break
    } catch (err: unknown) {
      let status: number | null = null

      if (err instanceof Error) {
        lastError = err.message
      } else {
        lastError = 'unknown'
      }

      // @google/genai ApiError menyediakan
      // HTTP status melalui property .status.
      //
      // .code tetap kita cek sebagai fallback
      // supaya lebih defensif terhadap bentuk error lain.
      if (
        typeof err === 'object' &&
        err !== null
      ) {
        const possibleError = err as {
          status?: unknown
          code?: unknown
        }

        const rawStatus =
          possibleError.status ??
          possibleError.code

        status =
          typeof rawStatus === 'number'
            ? rawStatus
            : null
      }

      lastStatus = status

      console.warn(
        `[generate-quiz] attempt ${attempt} gagal ` +
          `(status ${status ?? 'unknown'}): ${lastError}`
      )

      // =================================================
      // 429
      //
      // Bisa berarti RPM, TPM, RPD,
      // atau quota/rate limit Gemini lainnya.
      //
      // Retry langsung biasanya tidak membantu,
      // jadi stop supaya request tidak sia-sia.
      // =================================================
      if (status === 429) {
        break
      }

      // =================================================
      // 503
      //
      // Service/model sedang sibuk sementara.
      // Layak retry dengan exponential backoff:
      //
      // attempt 1 -> 500ms
      // attempt 2 -> 1000ms
      //
      // Jangan sleep kalau sudah attempt terakhir.
      // =================================================
      if (
        status === 503 &&
        attempt < MAX_ATTEMPTS
      ) {
        await sleep(
          500 * 2 ** (attempt - 1)
        )
      }

      // =================================================
      // Error lain:
      //
      // Misalnya AI menghasilkan JSON invalid
      // atau hasil gagal schema validation.
      //
      // generateQuizOnce akan throw,
      // lalu loop mencoba lagi tanpa delay.
      // =================================================
    }
  }

  // =====================================================
  // SEMUA ATTEMPT GAGAL
  //
  // Penting:
  // generate_and_persist belum dipanggil,
  // sehingga kredit BELUM dipotong.
  // =====================================================
  if (!questions) {
    // ---------------------------------------------------
    // Gemini rate limit / quota exhausted
    // ---------------------------------------------------
    if (lastStatus === 429) {
      return NextResponse.json(
        {
          error: 'AI_QUOTA_EXCEEDED',
          message:
            'Batas penggunaan AI sedang tercapai. Coba lagi beberapa saat atau periksa kuota Gemini.',
        },
        {
          status: 429,
        }
      )
    }

    // ---------------------------------------------------
    // Gemini service unavailable / overloaded
    // ---------------------------------------------------
    if (lastStatus === 503) {
      return NextResponse.json(
        {
          error: 'AI_UNAVAILABLE',
          message:
            'AI sedang sibuk. Coba lagi beberapa saat.',
        },
        {
          status: 503,
        }
      )
    }

    // ---------------------------------------------------
    // Error lain
    //
    // Contoh:
    // - JSON dari AI invalid
    // - Zod validation gagal
    // - response AI tidak sesuai schema
    // - error tidak dikenal
    // ---------------------------------------------------
    return NextResponse.json(
      {
        error: 'AI_GENERATION_FAILED',
        message:
          'AI gagal membuat soal dari materi ini. Coba lagi atau gunakan materi lain.',
        detail: lastError,
      },
      {
        status: 502,
      }
    )
  }

  // =====================================================
  // STEP 3: SIMPAN ATOMIK VIA RPC
  //
  // Admin client menggunakan service role / bypass RLS.
  //
  // Semua operasi penting dilakukan dalam satu
  // transaction PostgreSQL:
  //
  // - simpan questions
  // - buat user_progress
  // - kurangi credit
  // - catat credit_transactions
  //
  // Kredit baru dipotong setelah AI berhasil.
  // =====================================================
  const admin = createAdminClient()

  const {
    data: result,
    error: rpcError,
  } = await admin.rpc(
    'generate_and_persist',
    {
      p_user_id: user.id,
      p_material_id: material_id,
      p_questions: questions,
      p_cost: 1,
    }
  )

  if (rpcError) {
    const message = rpcError.message || ''

    // ===================================================
    // Kredit habis di antara:
    //
    // guard clause
    //        ↓
    // generate AI
    //        ↓
    // transaksi RPC
    //
    // Bisa terjadi karena concurrent request.
    // RPC tetap menjadi sumber kebenaran terakhir.
    // ===================================================
    if (
      message.includes(
        'INSUFFICIENT_CREDITS'
      )
    ) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_CREDITS',
        },
        {
          status: 402,
        }
      )
    }

    // ===================================================
    // Material tidak ada atau bukan milik user.
    //
    // RPC tetap melakukan validasi ownership
    // walaupun sebelumnya sudah dibaca melalui RLS.
    // ===================================================
    if (
      message.includes(
        'MATERIAL_FORBIDDEN'
      ) ||
      message.includes(
        'MATERIAL_NOT_FOUND'
      )
    ) {
      return NextResponse.json(
        {
          error: 'MATERIAL_FORBIDDEN',
        },
        {
          status: 403,
        }
      )
    }

    console.error(
      '[generate-quiz] RPC error:',
      rpcError
    )

    return NextResponse.json(
      {
        error: 'PERSIST_FAILED',
      },
      {
        status: 500,
      }
    )
  }

  // =====================================================
  // SUCCESS
  //
  // correct_answer TETAP tersimpan di database,
  // tetapi tidak pernah dikirim ke client.
  //
  // Client hanya menerima versi aman melalui
  // toClientQuestion().
  // =====================================================
  const {
    questions: persisted,
    ...meta
  } = (result ?? {}) as {
    questions?: DbQuestion[]
    [key: string]: unknown
  }

  const safeQuestions =
    (persisted ?? []).map(
      toClientQuestion
    )

  return NextResponse.json(
    {
      ok: true,
      ...meta,
      questions: safeQuestions,
    },
    {
      status: 201,
    }
  )
}