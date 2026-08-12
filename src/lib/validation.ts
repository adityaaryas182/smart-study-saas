// src/lib/validation.ts

import { z } from 'zod'

// =====================================================
// FORMAT QUESTION INTERNAL
//
// correct_index adalah sumber jawaban benar.
// 0 = pilihan pertama
// 1 = pilihan kedua
// 2 = pilihan ketiga
// 3 = pilihan keempat
// =====================================================
export const QuestionSchema = z.object({
  question_text: z
    .string()
    .min(1),

  options: z
    .array(
      z.string().min(1)
    )
    .length(4),

  correct_index: z
    .number()
    .int()
    .min(0)
    .max(3),
})

// Maksimal 10 soal per generation
export const QuizSchema = z
  .array(QuestionSchema)
  .min(1)
  .max(10)

// =====================================================
// REQUEST GENERATE QUIZ
//
// Client hanya mengirim:
// - material_id
// - count (opsional)
//
// Isi material tetap diambil dari database.
// =====================================================
export const GenerateQuizRequestSchema =
  z.object({
    material_id: z
      .string()
      .uuid(),

    count: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .default(5),
  })

export type Question =
  z.infer<typeof QuestionSchema>