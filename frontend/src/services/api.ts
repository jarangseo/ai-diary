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
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.')
    }
    const body = await response.text().catch(() => '')
    throw new Error(body || `Analysis failed (${response.status})`)
  }

  return response.json()
}
