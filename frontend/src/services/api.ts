const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

export async function analyzeDiary(content: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error('Failed to analyze diary')
  }

  return response.json()
}
