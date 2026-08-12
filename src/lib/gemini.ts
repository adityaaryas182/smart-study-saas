// src/lib/gemini.ts

import { GoogleGenAI } from '@google/genai'
import {
  QuizSchema,
  type Question,
} from './validation'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const MODEL = 'gemini-3.5-flash'

// =====================================================
// PROMPT
// Gemini hanya boleh mengembalikan correct_index,
// bukan correct_answer.
// =====================================================
function buildPrompt(
  content: string,
  count: number
): string {
  return `
Kamu adalah generator kuis.

Berdasarkan MATERI di bawah, buat ${count} soal pilihan ganda.

ATURAN OUTPUT KETAT:

- Kembalikan HANYA JSON array.
- Jangan gunakan markdown.
- Jangan gunakan teks pembuka.
- Jangan gunakan code block.
- Buat tepat ${count} soal.
- Setiap soal WAJIB memiliki tepat 4 pilihan jawaban.
- correct_index WAJIB berupa integer 0 sampai 3.
- correct_index menunjuk posisi jawaban benar di dalam options.
- Jangan menulis correct_answer.
- Bahasa soal mengikuti bahasa materi.

Format setiap elemen:

{
  "question_text": "string",
  "options": [
    "pilihan pertama",
    "pilihan kedua",
    "pilihan ketiga",
    "pilihan keempat"
  ],
  "correct_index": 0
}

MATERI:
"""
${content}
"""
`.trim()
}

// =====================================================
// GENERATE QUIZ
//
// Output langsung:
//
// {
//   question_text,
//   options,
//   correct_index
// }
//
// Tidak lagi dikonversi menjadi correct_answer.
// RPC yang akan menghitung correct_answer dari
// options[correct_index].
// =====================================================
export async function generateQuizOnce(
  content: string,
  count: number
): Promise<Question[]> {
  const response =
    await ai.models.generateContent({
      model: MODEL,

      contents: buildPrompt(
        content,
        count
      ),

      config: {
        responseMimeType:
          'application/json',

        temperature: 0.7,
      },
    })

  const raw = response.text

  if (!raw) {
    throw new Error(
      'EMPTY_RESPONSE'
    )
  }

  // Pastikan JSON valid
  const json = JSON.parse(raw)

  // Validasi struktur + correct_index 0..3
  const questions =
    QuizSchema.parse(json)

  // Gemini harus menghasilkan jumlah soal
  // sesuai request.
  if (questions.length !== count) {
    throw new Error(
      `INVALID_QUESTION_COUNT: expected ${count}, received ${questions.length}`
    )
  }

  return questions
}