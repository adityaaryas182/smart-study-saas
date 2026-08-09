// src/app/not-found.tsx
import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Compass size={20} className="text-slate-400" />
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Halaman yang kamu cari mungkin sudah dipindahkan atau tidak ada.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}