// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import { login, signInWithGoogle } from '../actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold">Masuk</h1>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form action={login} className="space-y-3">
        <input name="email" type="email" required placeholder="Email"
          className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password"
          className="w-full rounded border px-3 py-2" />
        <button type="submit" className="w-full rounded bg-black py-2 text-white">
          Masuk
        </button>
      </form>

      <div className="my-4 text-center text-sm text-gray-400">atau</div>

      <form action={signInWithGoogle}>
        <button type="submit" className="w-full rounded border py-2">
          Masuk dengan Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Belum punya akun? <Link href="/signup" className="underline">Daftar</Link>
      </p>
    </div>
  )
}