// src/app/materials/GenerateQuizButton.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

export default function GenerateQuizButton({
  materialId,
  existingCount = 0,
}: {
  materialId: string
  existingCount?: number
}) {
  const router = useRouter()

  const [status, setStatus] = useState<
    'idle' |
    'confirming' |
    'loading' |
    'success' |
    'error'
  >('idle')

  const [message, setMessage] = useState('')

  async function doGenerate() {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(
        '/api/generate-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            material_id: materialId,
            count: 5,
          }),
        }
      )

      const data = await res.json()

      if (data.ok) {
        setStatus('success')

        setMessage(
          `${data.questions.length} soal dibuat · sisa ${data.new_balance} kredit`
        )

        router.refresh()
      } else {
        setStatus('error')

        // Prioritas utama: pesan spesifik dari server.
        //
        // Contoh:
        // AI_QUOTA_EXCEEDED
        // -> "Batas penggunaan AI sedang tercapai..."
        //
        // AI_UNAVAILABLE
        // -> "AI sedang sibuk..."
        //
        // AI_GENERATION_FAILED
        // -> "AI gagal membuat soal..."
        //
        // Kalau server tidak memberikan message,
        // baru gunakan fallback lokal.
        setMessage(
          data.message ??
            (
              data.error ===
              'INSUFFICIENT_CREDITS'
                ? 'Kredit habis.'
                : 'Gagal membuat kuis.'
            )
        )
      }
    } catch {
      setStatus('error')
      setMessage(
        'Gagal terhubung ke server.'
      )
    }
  }

  // =====================================================
  // KLIK UTAMA
  //
  // Kalau materi sudah memiliki soal,
  // user harus konfirmasi sebelum generate lagi.
  // =====================================================
  function handleClick() {
    if (
      existingCount > 0 &&
      status === 'idle'
    ) {
      setStatus('confirming')
      return
    }

    doGenerate()
  }

  // =====================================================
  // MODE KONFIRMASI
  // =====================================================
  if (status === 'confirming') {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle
          size={14}
          className="text-amber-500"
        />

        <span className="text-xs text-amber-800">
          Materi ini sudah punya{' '}
          {existingCount} soal. Tambah 5 lagi?
        </span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() =>
              setStatus('idle')
            }
            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
          >
            Batal
          </button>

          <button
            onClick={doGenerate}
            className="rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Ya, tambah
          </button>
        </div>
      </div>
    )
  }

  // =====================================================
  // NORMAL STATE
  // =====================================================
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? (
          <Loader2
            size={13}
            className="animate-spin"
          />
        ) : (
          <Sparkles
            size={13}
            strokeWidth={2}
          />
        )}

        {status === 'loading'
          ? 'Membuat soal…'
          : existingCount > 0
            ? 'Generate Lagi'
            : 'Generate Kuis'}
      </button>

      {message && (
        <span
          className={`text-xs ${
            status === 'success'
              ? 'text-emerald-600'
              : 'text-red-600'
          }`}
        >
          {message}
        </span>
      )}
    </div>
  )
}