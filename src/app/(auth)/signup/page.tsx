// src/app/(auth)/signup/page.tsx
import Link from 'next/link'
import { signup, signInWithGoogle } from '../actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold">Daftar</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form action={signup} className="space-y-3">
        <input name="name" type="text" placeholder="Nama"
          className="w-full rounded border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email"
          className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" required minLength={6}
          placeholder="Password (min. 6)" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="w-full rounded bg-black py-2 text-white">
          Daftar
        </button>
      </form>

      <div className="my-4 text-center text-sm text-gray-400">atau</div>

      <form action={signInWithGoogle}>
        <button type="submit" className="w-full rounded border py-2">
          Daftar dengan Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Sudah punya akun? <Link href="/login" className="underline">Masuk</Link>
      </p>
    </div>
  )
}