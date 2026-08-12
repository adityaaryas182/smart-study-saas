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
  const { user, supabase } = await getAuthContext(request)

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

  const parsed = GenerateQuizRequestSchema.safeParse(body)

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
  // Retry maksimal 3 kali
  // =====================================================
  let questions = null
  let lastError = ''

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
      let status: unknown

      if (err instanceof Error) {
        lastError = err.message
      } else {
        lastError = 'unknown'
      }

      if (
        typeof err === 'object' &&
        err !== null
      ) {
        const possibleError = err as {
          status?: unknown
          code?: unknown
        }

        status =
          possibleError.status ??
          possibleError.code
      }

      console.warn(
        `[generate-quiz] attempt ${attempt} gagal: ${lastError}`
      )

      // Rate limit / service unavailable
      // 500ms -> 1s -> 2s
      if (status === 429 || status === 503) {
        await sleep(
          500 * 2 ** (attempt - 1)
        )
      }
    }
  }

  // =====================================================
  // SEMUA ATTEMPT GAGAL
  // Kredit tidak dipotong
  // =====================================================
  if (!questions) {
    return NextResponse.json(
      {
        error: 'AI_GENERATION_FAILED',
        detail: lastError,
      },
      {
        status: 502,
      }
    )
  }

  // =====================================================
  // STEP 3: SIMPAN ATOMIK VIA RPC
  // Admin client menggunakan service role / bypass RLS
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

    // Kredit habis di antara guard clause dan transaksi RPC
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

    // Material tidak ada atau bukan milik user
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
  // =====================================================
  const {
    questions: persisted,
    ...meta
  } = (result ?? {}) as {
    questions?: DbQuestion[]
    [key: string]: unknown
  }

  const safeQuestions =
    (persisted ?? []).map(toClientQuestion)

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