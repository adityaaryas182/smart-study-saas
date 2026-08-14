// src/app/study/StudySession.tsx

'use client'

import {
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import {
  Check,
  Loader2,
  PartyPopper,
  X,
} from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

type Question = {
  id: string
  question_text: string
  options: string[]
}

type Feedback = {
  is_correct: boolean
  correct_answer: string
}

export default function StudySession() {
  const [questions, setQuestions] =
    useState<Question[]>([])

  const [index, setIndex] = useState(0)

  const [loading, setLoading] =
    useState(true)

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<number | null>(null)

  const [feedback, setFeedback] =
    useState<Feedback | null>(null)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [correctCount, setCorrectCount] =
    useState(0)

  useEffect(() => {
    fetch(
      '/api/quiz/study-session?limit=10'
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setQuestions(data.questions)
        } else {
          setError(
            data.error ??
              'Gagal memuat sesi'
          )
        }
      })
      .catch(() => {
        setError(
          'Gagal memuat sesi'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const current = questions[index]

  async function submitAnswer(
    rating?: number
  ) {
    if (
      selectedIndex === null ||
      !current
    ) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(
        '/api/quiz/submit-answer',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            question_id: current.id,
            selected_index:
              selectedIndex,
            ...(rating
              ? {
                  quality_rating:
                    rating,
                }
              : {}),
          }),
        }
      )

      const data = await res.json()

      if (data.ok) {
        setFeedback({
          is_correct:
            data.is_correct,
          correct_answer:
            data.correct_answer,
        })
      } else {
        setError(
          data.error ??
            'Gagal mengirim jawaban'
        )
      }
    } catch {
      setError(
        'Gagal mengirim jawaban'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCheck() {
    await submitAnswer()
  }

  async function handleRate(
    rating: number
  ) {
    await submitAnswer(rating)

    setCorrectCount(
      (count) => count + 1
    )

    handleNext()
  }

  function handleNext() {
    setFeedback(null)
    setSelectedIndex(null)
    setError('')
    setIndex((current) => current + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-400">
        <Loader2
          size={16}
          className="animate-spin text-indigo-500"
        />

        Memuat sesi belajar…
      </div>
    )
  }

  if (
    error &&
    questions.length === 0
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          {error}
        </p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2
          className={`${spaceGrotesk.className} text-xl font-bold tracking-tight text-slate-900`}
        >
          Tidak ada soal jatuh tempo
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Semua materimu sudah terjadwal.
          Tambahkan materi baru untuk
          lanjut belajar.
        </p>

        <Link
          href="/materials"
          className="mt-6 inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/15 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Kelola Materi
        </Link>
      </div>
    )
  }

  if (index >= questions.length) {
    const pct = Math.round(
      (correctCount /
        questions.length) *
        100
    )

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
          <PartyPopper size={20} />
        </div>

        <h2
          className={`${spaceGrotesk.className} mt-4 text-xl font-bold tracking-tight text-slate-900`}
        >
          Sesi selesai
        </h2>

        <div className="mt-6 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold tracking-tight tabular-nums text-indigo-600">
            {correctCount}
          </span>

          <span className="text-xl text-slate-400">
            / {questions.length}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {pct}% jawaban benar
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          >
            Lihat Progres
          </Link>

          <Link
            href="/"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/15 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Selesai
          </Link>
        </div>
      </div>
    )
  }

  const progressPct =
    ((index +
      (feedback ? 1 : 0)) /
      questions.length) *
    100

  const correctAnswerIndex =
    feedback
      ? current.options.findIndex(
          (option) =>
            option ===
            feedback.correct_answer
        )
      : -1

  return (
    <>
      {/* =================================================
          PROGRESS
      ================================================= */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-500">
            Soal {index + 1} dari{' '}
            {questions.length}
          </span>

          <span className="tabular-nums text-slate-400">
            {correctCount} benar
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${progressPct}%`,
            }}
          />
        </div>
      </div>

      {/* =================================================
          QUESTION
      ================================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h1
          className={`${spaceGrotesk.className} text-lg font-semibold leading-relaxed text-slate-900`}
        >
          {current.question_text}
        </h1>

        <div className="mt-6 space-y-2">
          {current.options.map(
            (option, optionIndex) => {
              const isPicked =
                selectedIndex ===
                optionIndex

              const isAnswer =
                feedback !== null &&
                optionIndex ===
                  correctAnswerIndex

              const isWrongPick =
                feedback !== null &&
                isPicked &&
                !feedback.is_correct

              let cls =
                'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30'

              if (feedback) {
                if (isAnswer) {
                  cls +=
                    ' border-emerald-300 bg-emerald-50 text-emerald-900'
                } else if (
                  isWrongPick
                ) {
                  cls +=
                    ' border-red-300 bg-red-50 text-red-900'
                } else {
                  cls +=
                    ' border-slate-200 text-slate-400'
                }
              } else {
                cls += isPicked
                  ? ' border-indigo-300 bg-indigo-50 text-indigo-950'
                  : ' border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30'
              }

              return (
                <button
                  key={optionIndex}
                  disabled={!!feedback}
                  onClick={() =>
                    setSelectedIndex(
                      optionIndex
                    )
                  }
                  className={cls}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${
                      isAnswer
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                        : isWrongPick
                          ? 'border-red-300 bg-red-100 text-red-700'
                          : isPicked
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isAnswer ? (
                      <Check
                        size={13}
                      />
                    ) : isWrongPick ? (
                      <X size={13} />
                    ) : (
                      String.fromCharCode(
                        65 +
                          optionIndex
                      )
                    )}
                  </span>

                  <span className="flex-1">
                    {option}
                  </span>
                </button>
              )
            }
          )}
        </div>
      </div>

      {/* =================================================
          ANSWER / FEEDBACK
      ================================================= */}
      <div className="mt-6">
        {error && (
          <p className="mb-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {!feedback ? (
          <button
            onClick={handleCheck}
            disabled={
              selectedIndex === null ||
              submitting
            }
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/15 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting
              ? 'Memeriksa…'
              : 'Jawab'}
          </button>
        ) : feedback.is_correct ? (
          <div>
            {/* SEMANTIC COLOR TETAP EMERALD */}
            <p className="mb-3 text-center text-sm font-semibold text-emerald-600">
              Benar! Seberapa mudah kamu
              mengingatnya?
            </p>

            <div className="grid grid-cols-3 gap-2">
              <RateButton
                label="Susah"
                hint="Ulang lebih cepat"
                onClick={() =>
                  handleRate(3)
                }
                disabled={submitting}
              />

              <RateButton
                label="Sedang"
                hint="Jadwal normal"
                onClick={() =>
                  handleRate(4)
                }
                disabled={submitting}
              />

              <RateButton
                label="Mudah"
                hint="Ulang lebih lama"
                onClick={() =>
                  handleRate(5)
                }
                disabled={submitting}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            {/* SEMANTIC COLOR TETAP RED */}
            <p className="text-sm font-semibold text-red-600">
              Kurang tepat
            </p>

            <button
              onClick={handleNext}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/15 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {index + 1 <
              questions.length
                ? 'Lanjut'
                : 'Lihat Hasil'}
            </button>
          </div>
        )}
      </div>
    </>
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
      className="flex flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-3 text-center shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:opacity-40"
    >
      <span className="text-sm font-semibold text-slate-900">
        {label}
      </span>

      <span className="mt-0.5 text-[11px] text-slate-400">
        {hint}
      </span>
    </button>
  )
}