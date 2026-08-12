// src/app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { GenerateQuizRequestSchema } from '@/lib/validation'
import { generateQuizOnce } from '@/lib/gemini'

const MAX_ATTEMPTS = 3
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(request: Request) {
  // --- Auth ---
  const { user, supabase } = await getAuthContext(request)

  if (!user || !supabase) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }

  // --- Validasi body ---
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON_BODY' }, { status: 400 })
  }
  const parsed = GenerateQuizRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { material_id, count } = parsed.data

  // --- Ambil materi (RLS memastikan hanya milik user ini yang kembali) ---
  const { data: material, error: matErr } = await supabase
    .from('materials')
    .select('content')
    .eq('id', material_id)
    .single()
  if (matErr || !material) {
    return NextResponse.json({ error: 'MATERIAL_NOT_FOUND' }, { status: 404 })
  }

  // --- Step 1: Verify Credits (guard clause, fast-fail sebelum panggil AI) ---
  const { data: profile } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()
  if (!profile || profile.credits <= 0) {
    return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 })
  }

  // --- Step 2: Generate + Validate (retry loop, max 3) ---
  let questions = null
  let lastError = ''
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      questions = await generateQuizOnce(material.content, count)
      break // sukses -> keluar loop
    } catch (err: any) {
      lastError = err?.message ?? 'unknown'
      const status = err?.status ?? err?.code
      console.warn(`[generate-quiz] attempt ${attempt} gagal: ${lastError}`)
      // 429 rate-limit / 503 -> backoff eksponensial. Malformed/Zod -> retry langsung.
      if (status === 429 || status === 503) {
        await sleep(500 * 2 ** (attempt - 1)) // 500ms -> 1s -> 2s
      }
    }
  }

  // --- Fallback: semua attempt gagal -> 502, TANPA potong kredit ---
  if (!questions) {
    return NextResponse.json(
      { error: 'AI_GENERATION_FAILED', detail: lastError },
      { status: 502 }
    )
  }

  // --- Step 3: Persist ATOMIK via RPC (service role, bypass RLS) ---
  const admin = createAdminClient()
  const { data: result, error: rpcErr } = await admin.rpc('generate_and_persist', {
    p_user_id: user.id,
    p_material_id: material_id,
    p_questions: questions,
    p_cost: 1,
  })

  if (rpcErr) {
    const msg = rpcErr.message || ''
    // Race: kredit habis antara guard dan persist (cek final di dalam transaksi).
    if (msg.includes('INSUFFICIENT_CREDITS')) {
      return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 })
    }
    if (msg.includes('MATERIAL_FORBIDDEN') || msg.includes('MATERIAL_NOT_FOUND')) {
      return NextResponse.json({ error: 'MATERIAL_FORBIDDEN' }, { status: 403 })
    }
    console.error('[generate-quiz] RPC error:', rpcErr)
    return NextResponse.json({ error: 'PERSIST_FAILED' }, { status: 500 })
  }

  // --- Sukses: 201 + { new_balance, questions } dari fungsi RPC ---
  return NextResponse.json({ ok: true, ...result }, { status: 201 })
}