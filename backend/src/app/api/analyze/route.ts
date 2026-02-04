import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Request schema
const analyzeRequestSchema = z.object({
  content: z.string().min(1).max(10000),
})

// Response schema for AI output
const emotionAnalysisSchema = z.object({
  primaryEmotion: z.string(),
  secondaryEmotions: z.array(z.string()).max(2),
  emotionScore: z.number().min(-1).max(1),
  summary: z.string(),
  reflectionQuestions: z.array(z.string()).min(1).max(2),
  isSafetyAlert: z.boolean(),
})

type EmotionAnalysis = z.infer<typeof emotionAnalysisSchema>

// Safety keywords for detection
const SAFETY_KEYWORDS = [
  '자해',
  '자살',
  '죽고 싶',
  '죽고싶',
  '죽을',
  '끝내고 싶',
  '사라지고 싶',
]

function checkSafetyAlert(content: string): boolean {
  return SAFETY_KEYWORDS.some((keyword) => content.includes(keyword))
}

const SAFETY_RESPONSE: EmotionAnalysis = {
  primaryEmotion: '힘듦',
  secondaryEmotions: [],
  emotionScore: -0.8,
  summary: '지금 많이 힘드시군요. 당신의 감정은 소중합니다.',
  reflectionQuestions: [],
  isSafetyAlert: true,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = analyzeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { content } = parsed.data

    // Check for safety alert first
    if (checkSafetyAlert(content)) {
      return NextResponse.json({
        ...SAFETY_RESPONSE,
        safetyResources: {
          message: '힘든 시간을 보내고 계시다면, 전문적인 도움을 받아보세요.',
          resources: [
            { name: '자살예방상담전화', number: '1393' },
            { name: '정신건강위기상담전화', number: '1577-0199' },
            { name: '생명의전화', number: '1588-9191' },
          ],
        },
      })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `당신은 사용자의 일기를 읽고 감정을 분석하는 AI입니다.
심리 치료사가 아닌, 자기 성찰을 돕는 친구 같은 역할입니다.

다음 형식으로만 JSON을 반환하세요:
{
  "primaryEmotion": "대표 감정 (1개, 한글)",
  "secondaryEmotions": ["보조 감정 1", "보조 감정 2"],
  "emotionScore": 감정 점수 (-1.0 ~ 1.0, 부정~긍정),
  "summary": "오늘의 감정을 공감하며 정리하는 1문장",
  "reflectionQuestions": ["자기 성찰을 돕는 질문 1", "질문 2"],
  "isSafetyAlert": false
}

규칙:
- 판단하지 말고 공감하세요
- 해결책을 제시하지 마세요
- 성찰 질문은 열린 질문으로 작성하세요
- 감정 라벨은 구체적으로 (예: '슬픔' 대신 '아쉬움', '허탈함' 등)`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    const analysis = JSON.parse(result)
    const validated = emotionAnalysisSchema.parse(analysis)

    return NextResponse.json(validated)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze diary' },
      { status: 500 }
    )
  }
}
