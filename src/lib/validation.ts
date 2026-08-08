// src/lib/validation.ts
import { z } from 'zod'

// Satu soal. .refine memastikan correct_answer benar-benar ADA di options —
// validasi semantik, bukan cuma struktur.
export const QuestionSchema = z
  .object({
    question_text: z.string().min(1),
    options: z.array(z.string().min(1)).length(4), // pilihan ganda A-D
    correct_answer: z.string().min(1),
  })
  .refine((q) => q.options.includes(q.correct_answer), {
    message: 'correct_answer harus salah satu dari options',
    path: ['correct_answer'],
  })

export const QuizSchema = z.array(QuestionSchema).min(1).max(10)

// Validasi request masuk. Client HANYA kirim material_id — text-nya
// kita ambil dari DB (lebih aman, tak bisa dipalsukan).
export const GenerateQuizRequestSchema = z.object({
  material_id: z.string().uuid(),
  count: z.number().int().min(1).max(10).optional().default(5),
})

export type Question = z.infer<typeof QuestionSchema>