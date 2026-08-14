// src/app/api/materials/upload-docx/route.ts

import { NextResponse } from 'next/server'
import mammoth from 'mammoth'

import { createClient } from '@/lib/supabase/server'
import { isProUser, materialLimit } from '@/lib/subscription'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MIN_TEXT_LENGTH = 100

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }

  // --- Tier gating: cek kuota materi (sama seperti upload PDF/createMaterial) ---
  const { data: profile } = await supabase
    .from('users')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .single()

  const limit = materialLimit(profile)

  const { count } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: 'MATERIAL_LIMIT',
        message: isProUser(profile)
          ? `Batas ${limit} materi tercapai.`
          : `Batas ${limit} materi tercapai. Upgrade ke Pro untuk lebih banyak.`,
      },
      { status: 403 }
    )
  }

  // --- Ambil file dari form-data ---
  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_FORM' },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  const title = String(formData.get('title') ?? '').trim()

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'NO_FILE' },
      { status: 400 }
    )
  }

  // Wajib cek ekstensi DAN MIME.
  //
  // MIME kosong tetap diperbolehkan karena sebagian browser/OS
  // tidak mengirim MIME untuk DOCX.
  const hasDocxExtension = /\.docx$/i.test(file.name)
  const hasValidMime = file.type === DOCX_MIME || file.type === ''

  if (!hasDocxExtension || !hasValidMime) {
    return NextResponse.json(
      {
        error: 'NOT_DOCX',
        message: 'File harus berformat DOCX.',
      },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: 'FILE_TOO_LARGE',
        message: 'Ukuran maksimal 10 MB.',
      },
      { status: 400 }
    )
  }

  // --- Ekstrak teks dengan Mammoth ---
  let extractedText = ''

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await mammoth.extractRawText({ buffer })

    extractedText = result.value.trim()
  } catch (err) {
    console.error('[upload-docx] ekstraksi gagal:', err)

    return NextResponse.json(
      {
        error: 'EXTRACTION_FAILED',
        message: 'Gagal membaca DOCX. File mungkin rusak.',
      },
      { status: 422 }
    )
  }

  // --- Guard: DOCX kosong / tidak menghasilkan cukup teks ---
  if (extractedText.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: 'NO_TEXT',
        message:
          'DOCX ini tidak memiliki cukup teks untuk dijadikan materi. Coba file lain atau tempel teksnya manual.',
      },
      { status: 422 }
    )
  }

  // --- Simpan ke materials (pipeline sama seperti PDF) ---
  const finalTitle =
    title ||
    file.name.replace(/\.docx$/i, '') ||
    'Materi dari DOCX'

  const { data: material, error } = await supabase
    .from('materials')
    .insert({
      user_id: user.id,
      title: finalTitle,
      content: extractedText,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: 'SAVE_FAILED',
        message: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      material_id: material.id,
      chars: extractedText.length,
    },
    { status: 201 }
  )
}