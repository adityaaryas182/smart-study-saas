// src/lib/serializers.ts

export type DbQuestion = {
    id: string
    question_text: string
    options: unknown
    correct_answer?: string
    [key: string]: unknown
  }
  
  /**
   * Menghapus correct_answer sebelum question
   * dikirim ke frontend/client.
   */
  export function toClientQuestion({
    correct_answer: _correctAnswer,
    ...safe
  }: DbQuestion) {
    return safe
  }