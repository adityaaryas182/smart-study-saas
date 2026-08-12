// src/lib/serializers.ts

export type DbQuestion = {
    id: string
    question_text: string
    options: unknown
  
    // Hanya untuk server/database
    correct_answer?: string
    correct_index?: number
  
    [key: string]: unknown
  }
  
  /**
   * Menghapus seluruh informasi jawaban benar
   * sebelum question dikirim ke client.
   *
   * correct_answer dan correct_index tetap
   * tersedia di database untuk grading server-side.
   */
  export function toClientQuestion({
    correct_answer: _correctAnswer,
    correct_index: _correctIndex,
    ...safe
  }: DbQuestion) {
    return safe
  }