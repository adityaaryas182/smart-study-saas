// src/app/materials/GenerateQuizButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

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
        setMessage(`${data.questions.length} soal dibuat · sisa ${data.new_balance} kredit`)
        router.refresh()
      } else {
        setStatus('error')
        setMessage(
          data.error === 'INSUFFICIENT_CREDITS' ? 'Kredit habis.' :
          data.error === 'AI_GENERATION_FAILED' ? 'AI gagal, coba lagi.' :
          'Gagal membuat kuis.'
        )
      }
    } catch {
      setStatus('error')
      setMessage('Gagal terhubung ke server.')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
      >
        {status === 'loading'
          ? <Loader2 size={13} className="animate-spin" />
          : <Sparkles size={13} strokeWidth={2} />}
        {status === 'loading' ? 'Membuat soal…' : 'Generate Kuis'}
      </button>

      {message && (
        <span className={`text-xs ${status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  )
}