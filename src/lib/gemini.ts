// src/lib/gemini.ts
import { GoogleGenAI } from '@google/genai'
import { QuizSchema, type Question } from './validation'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
const MODEL = 'gemini-3.5-flash' // model free-tier; bisa diganti flash lain jika perlu

function buildPrompt(content: string, count: number): string {
  return `Kamu adalah generator kuis. Berdasarkan MATERI di bawah, buat ${count} soal pilihan ganda.
Aturan output KETAT:
- Kembalikan HANYA JSON array. Tanpa teks pembuka, tanpa markdown, tanpa \`\`\`.
- Tiap elemen: {"question_text": string, "options": [empat string], "correct_answer": string}
- "correct_answer" WAJIB sama persis dengan salah satu string di "options".
- Bahasa soal mengikuti bahasa materi.

MATERI:
"""
${content}
"""`
}

// Satu percobaan. Melempar error (JSON invalid / ZodError / API error)
// yang akan ditangkap oleh retry loop di endpoint.
export async function generateQuizOnce(content: string, count: number): Promise<Question[]> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(content, count),
    config: {
      responseMimeType: 'application/json', // memaksa output JSON di sisi model
      temperature: 0.7,
    },
  })

  const raw = response.text
  if (!raw) throw new Error('EMPTY_RESPONSE')

  const parsed = JSON.parse(raw)   // SyntaxError jika bukan JSON -> retry
  return QuizSchema.parse(parsed)  // ZodError jika struktur salah -> retry
}