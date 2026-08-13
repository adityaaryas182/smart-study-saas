// src/app/study/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Loader2, PartyPopper } from 'lucide-react'

type Question = {
  id: string
  question_text: string
  options: string[]
}

type Feedback = {
  is_correct: boolean
  correct_answer: string
}

export default function StudyPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    fetch('/api/quiz/study-session?limit=10')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setQuestions(data.questions)
        } else {
          setError(data.error ?? 'Gagal memuat sesi')
        }
      })
      .catch(() => {
        setError('Gagal memuat sesi')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const current = questions[index]

  async function submitAnswer(rating?: number) {
    if (selectedIndex === null || !current) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: current.id,
          selected_index: selectedIndex,
          ...(rating ? { quality_rating: rating } : {}),
        }),
      })

      const data = await res.json()

      if (data.ok) {
        setFeedback({
          is_correct: data.is_correct,
          correct_answer: data.correct_answer,
        })
      } else {
        setError(data.error ?? 'Gagal mengirim jawaban')
      }
    } catch {
      setError('Gagal mengirim jawaban')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCheck() {
    await submitAnswer()
  }

  async function handleRate(rating: number) {
    await submitAnswer(rating)
    setCorrectCount((c) => c + 1)
    handleNext()
  }

  function handleNext() {
    setFeedback(null)
    setSelectedIndex(null)
    setError('')
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

  if (error && questions.length === 0) {
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

            <span className="text-xl text-slate-400">
              / {questions.length}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {pct}% jawaban benar
          </p>

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

  const progressPct =
    ((index + (feedback ? 1 : 0)) / questions.length) * 100

  const correctAnswerIndex = feedback
    ? current.options.findIndex(
        (opt) => opt === feedback.correct_answer
      )
    : -1

  return (
    <Shell>
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-slate-500">
            Soal {index + 1} dari {questions.length}
          </span>

          <span className="tabular-nums text-slate-400">
            {correctCount} benar
          </span>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-lg font-medium leading-relaxed text-slate-900">
          {current.question_text}
        </h1>

        <div className="mt-6 space-y-2">
          {current.options.map((opt, i) => {
            const isPicked = selectedIndex === i

            const isAnswer =
              feedback !== null &&
              i === correctAnswerIndex

            const isWrongPick =
              feedback !== null &&
              isPicked &&
              !feedback.is_correct

            let cls =
              'flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition'

            if (feedback) {
              if (isAnswer) {
                cls +=
                  ' border-emerald-300 bg-emerald-50 text-emerald-900'
              } else if (isWrongPick) {
                cls +=
                  ' border-red-300 bg-red-50 text-red-900'
              } else {
                cls +=
                  ' border-slate-200 text-slate-400'
              }
            } else {
              cls += isPicked
                ? ' border-slate-900 bg-slate-50 text-slate-900'
                : ' border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }

            return (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => setSelectedIndex(i)}
                className={cls}
              >
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
                  {isAnswer ? (
                    <Check size={13} />
                  ) : isWrongPick ? (
                    <X size={13} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>

                <span className="flex-1">
                  {opt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <p className="mb-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {!feedback ? (
          <button
            onClick={handleCheck}
            disabled={selectedIndex === null || submitting}
            className="w-full rounded-md bg-slate-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? 'Memeriksa…' : 'Jawab'}
          </button>
        ) : feedback.is_correct ? (
          <div>
            <p className="mb-3 text-center text-sm font-medium text-emerald-600">
              Benar! Seberapa mudah kamu mengingatnya?
            </p>

            <div className="grid grid-cols-3 gap-2">
              <RateButton
                label="Susah"
                hint="Ulang lebih cepat"
                onClick={() => handleRate(3)}
                disabled={submitting}
              />

              <RateButton
                label="Sedang"
                hint="Jadwal normal"
                onClick={() => handleRate(4)}
                disabled={submitting}
              />

              <RateButton
                label="Mudah"
                hint="Ulang lebih lama"
                onClick={() => handleRate(5)}
                disabled={submitting}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-600">
              Kurang tepat
            </p>

            <button
              onClick={handleNext}
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              {index + 1 < questions.length
                ? 'Lanjut'
                : 'Lihat Hasil'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  )
}

function RateButton({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string
  hint: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center rounded-md border border-slate-200 bg-white py-3 text-center shadow-sm transition hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40"
    >
      <span className="text-sm font-medium text-slate-900">
        {label}
      </span>

      <span className="mt-0.5 text-[11px] text-slate-400">
        {hint}
      </span>
    </button>
  )
}

function Shell({
  children,
}: {
  children: React.ReactNode
}) {
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