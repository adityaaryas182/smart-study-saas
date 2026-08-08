// src/app/study/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  // Muat sesi saat halaman dibuka.
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

  if (loading) return <Centered>Memuat sesi belajar…</Centered>
  if (error) return <Centered><p className="text-red-600">{error}</p></Centered>
  if (questions.length === 0) {
    return (
      <Centered>
        <p className="mb-4">Tidak ada soal yang jatuh tempo. 🎉</p>
        <Link href="/materials" className="underline">Buat kuis dari materi</Link>
      </Centered>
    )
  }
  if (index >= questions.length) {
    return (
      <Centered>
        <h2 className="mb-2 text-xl font-bold">Sesi selesai! 🎯</h2>
        <p className="mb-4 text-sm text-gray-500">
          Skor: {correctCount} / {questions.length} benar.
        </p>
        <Link href="/" className="underline">Kembali ke beranda</Link>
      </Centered>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between text-sm text-gray-500">
        <Link href="/" className="underline">← Beranda</Link>
        <span>Soal {index + 1} / {questions.length}</span>
      </div>

      <h1 className="mb-6 text-lg font-semibold">{current.question_text}</h1>

      <div className="space-y-2">
        {current.options.map((opt) => {
          const isPicked = selected === opt
          const isAnswer = feedback && opt === feedback.correct_answer
          const isWrongPick = feedback && isPicked && !feedback.is_correct

          let cls = 'w-full rounded border px-4 py-3 text-left transition'
          if (feedback) {
            if (isAnswer) cls += ' border-green-500 bg-green-50'
            else if (isWrongPick) cls += ' border-red-500 bg-red-50'
            else cls += ' opacity-60'
          } else {
            cls += isPicked ? ' border-black bg-gray-50' : ' hover:bg-gray-50'
          }

          return (
            <button key={opt} disabled={!!feedback} onClick={() => setSelected(opt)} className={cls}>
              {opt}
            </button>
          )
        })}
      </div>

      {feedback ? (
        <div className="mt-6">
          <p className={feedback.is_correct ? 'text-green-600' : 'text-red-600'}>
            {feedback.is_correct ? '✓ Benar!' : '✗ Kurang tepat.'}
          </p>
          <button onClick={handleNext} className="mt-4 w-full rounded bg-black py-3 text-white">
            {index + 1 < questions.length ? 'Soal berikutnya →' : 'Selesai'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="mt-6 w-full rounded bg-black py-3 text-white disabled:opacity-40"
        >
          {submitting ? 'Mengirim…' : 'Jawab'}
        </button>
      )}
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-xl px-4 py-20 text-center">{children}</main>
}