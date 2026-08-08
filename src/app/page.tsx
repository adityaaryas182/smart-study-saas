// src/app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './(auth)/actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="mx-auto max-w-sm py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Smart Study &amp; Quiz</h1>
        <Link href="/login" className="underline">Masuk untuk mulai</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-sm py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold">Halo, {user.email}</h1>
      <p className="mb-6 text-sm text-gray-500">Kamu sudah login. 🎉</p>
      {/* tambahkan baris ini di src/app/page.tsx, sebelum <form action={signOut}> */}
      <Link href="/dashboard" className="mb-3 inline-block rounded border px-4 py-2">
        Dashboard
      </Link>

      <Link href="/study" className="mb-3 inline-block rounded bg-black px-4 py-2 text-white">
        Mulai Belajar
      </Link>

      <Link
        href="/materials"
        className="mb-4 inline-block rounded bg-black px-4 py-2 text-white"
      >
        Kelola Materi
      </Link>
      <form action={signOut}>
        <button className="rounded border px-4 py-2">Keluar</button>
      </form>
    </main>
  )
}