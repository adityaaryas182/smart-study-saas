// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Di produksi, ini tempat mengirim ke layanan logging (Sentry, dsb).
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <AlertTriangle size={20} className="text-slate-400" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Ada yang tidak beres
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Terjadi kesalahan tak terduga. Coba muat ulang halaman, atau kembali ke beranda.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <RotateCw size={14} />
            Coba lagi
          </button>
          <Link
            href="/"
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}