// src/app/materials/GenerateQuizButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateQuizButton({ materialId }: { materialId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleGenerate() {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material_id: materialId, count: 5 }),
      })
      const data = await res.json()

      if (data.ok) {
        setStatus('success')
        setMessage(`${data.questions.length} soal dibuat! Sisa kredit: ${data.new_balance}`)
        router.refresh() // segarkan data server (mis. kalau nanti tampilkan jumlah soal)
      } else {
        setStatus('error')
        // Terjemahkan kode error jadi pesan ramah.
        const msg =
          data.error === 'INSUFFICIENT_CREDITS' ? 'Kredit habis.' :
          data.error === 'AI_GENERATION_FAILED' ? 'AI gagal, coba lagi.' :
          'Gagal membuat kuis.'
        setMessage(msg)
      }
    } catch {
      setStatus('error')
      setMessage('Gagal terhubung ke server.')
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-40"
      >
        {status === 'loading' ? 'Membuat soal…' : 'Generate Kuis'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}