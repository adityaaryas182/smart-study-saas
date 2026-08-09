// src/app/materials/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isProUser, materialLimit } from '@/lib/subscription'

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ambil DUA kolom, bukan cuma plan.
  const { data: profile } = await supabase
    .from('users')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .single()

  const limit = materialLimit(profile)
  const isPro = isProUser(profile)

  const { count } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limit) {
    redirect(
      `/materials?error=${encodeURIComponent(
        isPro
          ? `Batas ${limit} materi tercapai.`
          : `Batas ${limit} materi tercapai. Upgrade ke Pro untuk menambah lebih banyak.`
      )}`
    )
  }

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

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

// deleteMaterial 
export async function deleteMaterial(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = String(formData.get('id'))

  // RLS sudah menjamin kepemilikan, tapi .eq('user_id') = defense-in-depth.
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