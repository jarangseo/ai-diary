// Remove trailing slash to prevent double slashes in URLs
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

export interface AnalyzeResponse {
  primaryEmotion: string
  secondaryEmotions: string[]
  emotionScore: number
  summary: string
  reflectionQuestions: string[]
  isSafetyAlert: boolean
  safetyResources?: {
    message: string
    resources: { name: string; number: string }[]
  }
}

export type AIModel = 'openai' | 'gemini'

export async function analyzeDiary(
  content: string,
  language: string = 'en',
  model: AIModel = 'openai'
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, language, model }),
  })

  if (!response.ok) {
    throw new Error('Failed to analyze diary')
  }

  return response.json()
}
