// src/app/materials/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()

  // user_id diambil dari SESI, bukan dari form. Jangan percaya input client.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  // Validasi dasar (Minggu 2 kita perketat dgn Zod di API generate).
  if (!title || !content) {
    redirect('/materials?error=Judul dan materi wajib diisi')
  }

  const { error } = await supabase
    .from('materials')
    .insert({ user_id: user.id, title, content })

  if (error) {
    redirect(`/materials?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/materials')
  redirect('/materials?message=Materi tersimpan')
}

export async function deleteMaterial(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = String(formData.get('id'))

  // RLS sudah menjamin user hanya bisa hapus miliknya, tapi kita
  // tetap eksplisit .eq('user_id') sebagai defense-in-depth.
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect(`/materials?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/materials')
}