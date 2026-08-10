// src/app/api/materials/upload-pdf/route.ts
import { NextResponse } from 'next/server'
import { extractText, getDocumentProxy } from 'unpdf'
import { createClient } from '@/lib/supabase/server'
import { isProUser, materialLimit } from '@/lib/subscription'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MIN_TEXT_LENGTH = 100 // di bawah ini, anggap PDF scan/kosong

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  }

  // --- Tier gating: cek kuota materi (sama seperti createMaterial) ---
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
    return NextResponse.json({ error: 'INVALID_FORM' }, { status: 400 })
  }

  const file = formData.get('file')
  const title = String(formData.get('title') ?? '').trim()

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'NO_FILE' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'NOT_PDF', message: 'File harus PDF.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'FILE_TOO_LARGE', message: 'Ukuran maksimal 10 MB.' },
      { status: 400 }
    )
  }

  // --- Ekstrak teks dengan unpdf ---
  let extractedText = ''
  try {
    const buffer = await file.arrayBuffer()
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    extractedText = (typeof text === 'string' ? text : text.join('\n')).trim()
  } catch (err) {
    console.error('[upload-pdf] ekstraksi gagal:', err)
    return NextResponse.json(
      { error: 'EXTRACTION_FAILED', message: 'Gagal membaca PDF. File mungkin rusak.' },
      { status: 422 }
    )
  }

  // --- Guard: PDF hasil scan (gambar) menghasilkan teks minim/kosong ---
  if (extractedText.length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: 'NO_TEXT',
        message: 'PDF ini sepertinya hasil scan/gambar. Coba PDF berbasis teks, atau tempel teksnya manual.',
      },
      { status: 422 }
    )
  }

  // --- Simpan ke materials (pakai pipeline lama) ---
  const finalTitle = title || file.name.replace(/\.pdf$/i, '') || 'Materi dari PDF'
  const { data: material, error } = await supabase
    .from('materials')
    .insert({ user_id: user.id, title: finalTitle, content: extractedText })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'SAVE_FAILED', message: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { ok: true, material_id: material.id, chars: extractedText.length },
    { status: 201 }
  )
}