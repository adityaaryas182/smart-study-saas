// src/app/study/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Loader2, PartyPopper } from 'lucide-react'

type Question = { id: string; question_text: string; options: string[] }
type Feedback = { is_correct: boolean; correct_answer: string }

export default function StudyPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    fetch('/api/quiz/study-session?limit=10')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setQuestions(data.questions)
        else setError(data.error ?? 'Gagal memuat sesi')
      })
      .catch(() => setError('Gagal memuat sesi'))
      .finally(() => setLoading(false))
  }, [])

  const current = questions[index]

  async function handleSubmit() {
    if (!selected || !current) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: current.id, user_answer: selected }),
      })
      const data = await res.json()
      if (data.ok) {
        setFeedback({ is_correct: data.is_correct, correct_answer: data.correct_answer })
        if (data.is_correct) setCorrectCount((c) => c + 1)
      } else {
        setError(data.error ?? 'Gagal mengirim jawaban')
      }
    } catch {
      setError('Gagal mengirim jawaban')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    setFeedback(null)
    setSelected(null)
    setIndex((i) => i + 1)
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Memuat sesi belajar…
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </Shell>
    )
  }

  if (questions.length === 0) {
    return (
      <Shell>
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Tidak ada soal jatuh tempo
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Semua materimu sudah terjadwal. Tambahkan materi baru untuk lanjut belajar.
          </p>
          <Link
            href="/materials"
            className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Kelola Materi
          </Link>
        </div>
      </Shell>
    )
  }

  // Layar hasil akhir
  if (index >= questions.length) {
    const pct = Math.round((correctCount / questions.length) * 100)
    return (
      <Shell>
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
          <PartyPopper size={22} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Sesi selesai
          </h2>
          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight tabular-nums text-slate-900">
              {correctCount}
            </span>
            <span className="text-xl text-slate-400">/ {questions.length}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{pct}% jawaban benar</p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Lihat Progres
            </Link>
            <Link
              href="/"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Selesai
            </Link>
          </div>
        </div>
      </Shell>
    )
  }

  const progressPct = ((index + (feedback ? 1 : 0)) / questions.length) * 100

  return (
    <Shell>
      {/* Progress bar sesi */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-slate-500">
            Soal {index + 1} dari {questions.length}
          </span>
          <span className="tabular-nums text-slate-400">{correctCount} benar</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Kartu soal */}
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-lg font-medium leading-relaxed text-slate-900">
          {current.question_text}
        </h1>

        <div className="mt-6 space-y-2">
          {current.options.map((opt, i) => {
            const isPicked = selected === opt
            const isAnswer = feedback && opt === feedback.correct_answer
            const isWrongPick = feedback && isPicked && !feedback.is_correct

            let cls =
              'flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition'
            if (feedback) {
              if (isAnswer) cls += ' border-emerald-300 bg-emerald-50 text-emerald-900'
              else if (isWrongPick) cls += ' border-red-300 bg-red-50 text-red-900'
              else cls += ' border-slate-200 text-slate-400'
            } else {
              cls += isPicked
                ? ' border-slate-900 bg-slate-50 text-slate-900'
                : ' border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }

            return (
              <button
                key={opt}
                disabled={!!feedback}
                onClick={() => setSelected(opt)}
                className={cls}
              >
                {/* Penanda huruf A/B/C/D */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs font-medium ${
                    isAnswer
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                      : isWrongPick
                      ? 'border-red-300 bg-red-100 text-red-700'
                      : isPicked
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {isAnswer ? <Check size={13} /> : isWrongPick ? <X size={13} /> : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Aksi */}
      <div className="mt-6">
        {feedback ? (
          <div className="flex items-center justify-between gap-4">
            <p
              className={`text-sm font-medium ${
                feedback.is_correct ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {feedback.is_correct ? 'Benar' : 'Kurang tepat'}
            </p>
            <button
              onClick={handleNext}
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              {index + 1 < questions.length ? 'Lanjut' : 'Lihat Hasil'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full rounded-md bg-slate-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? 'Mengirim…' : 'Jawab'}
          </button>
        )}
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Beranda
        </Link>
        {children}
      </main>
    </div>
  )
}