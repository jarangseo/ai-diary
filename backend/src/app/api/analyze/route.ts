import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { z } from 'zod'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Request schema
const analyzeRequestSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.enum(['en', 'ko', 'de']).optional().default('en'),
  model: z.enum(['openai', 'gemini']).optional().default('openai'),
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
type Language = 'en' | 'ko' | 'de'

// Safety keywords for detection (multilingual)
const SAFETY_KEYWORDS: Record<Language, string[]> = {
  ko: ['자해', '자살', '죽고 싶', '죽고싶', '죽을', '끝내고 싶', '사라지고 싶'],
  en: ['self-harm', 'suicide', 'want to die', 'end my life', 'kill myself'],
  de: ['selbstverletzung', 'suizid', 'sterben wollen', 'mein leben beenden'],
}

function checkSafetyAlert(content: string): boolean {
  // Check all language keywords for safety
  const keywords = [...SAFETY_KEYWORDS.ko, ...SAFETY_KEYWORDS.en, ...SAFETY_KEYWORDS.de]
  const lowerContent = content.toLowerCase()
  return keywords.some((keyword) => lowerContent.includes(keyword.toLowerCase()))
}

const SAFETY_RESPONSES: Record<Language, EmotionAnalysis> = {
  ko: {
    primaryEmotion: '힘듦',
    secondaryEmotions: [],
    emotionScore: -0.8,
    summary: '지금 많이 힘드시군요. 당신의 감정은 소중합니다.',
    reflectionQuestions: [],
    isSafetyAlert: true,
  },
  en: {
    primaryEmotion: 'Struggling',
    secondaryEmotions: [],
    emotionScore: -0.8,
    summary: "It sounds like you're going through a difficult time. Your feelings matter.",
    reflectionQuestions: [],
    isSafetyAlert: true,
  },
  de: {
    primaryEmotion: 'Belastet',
    secondaryEmotions: [],
    emotionScore: -0.8,
    summary: 'Es klingt, als hättest du gerade eine schwere Zeit. Deine Gefühle sind wichtig.',
    reflectionQuestions: [],
    isSafetyAlert: true,
  },
}

const SAFETY_RESOURCES: Record<Language, { message: string; resources: { name: string; number: string }[] }> = {
  ko: {
    message: '힘든 시간을 보내고 계시다면, 전문적인 도움을 받아보세요.',
    resources: [
      { name: '자살예방상담전화', number: '1393' },
      { name: '정신건강위기상담전화', number: '1577-0199' },
      { name: '생명의전화', number: '1588-9191' },
    ],
  },
  en: {
    message: 'If you are going through a difficult time, please seek professional help.',
    resources: [
      { name: 'National Suicide Prevention Lifeline', number: '988' },
      { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
      { name: 'International Association for Suicide Prevention', number: 'https://www.iasp.info/resources/Crisis_Centres/' },
    ],
  },
  de: {
    message: 'Wenn du eine schwere Zeit durchmachst, suche bitte professionelle Hilfe.',
    resources: [
      { name: 'Telefonseelsorge', number: '0800 111 0 111' },
      { name: 'Telefonseelsorge', number: '0800 111 0 222' },
      { name: 'Kinder- und Jugendtelefon', number: '116 111' },
    ],
  },
}

// Mock responses for development
const MOCK_RESPONSES: Record<Language, { positive: EmotionAnalysis; negative: EmotionAnalysis; neutral: EmotionAnalysis }> = {
  ko: {
    positive: {
      primaryEmotion: '만족감',
      secondaryEmotions: ['기대', '평온'],
      emotionScore: 0.7,
      summary: '오늘 하루가 충만했던 것 같네요. 이런 순간들을 기억해두면 좋겠어요.',
      reflectionQuestions: [
        '오늘 가장 기분 좋았던 순간은 언제였나요?',
        '이 감정을 더 자주 느끼려면 무엇을 할 수 있을까요?',
      ],
      isSafetyAlert: false,
    },
    negative: {
      primaryEmotion: '지침',
      secondaryEmotions: ['답답함', '아쉬움'],
      emotionScore: -0.4,
      summary: '오늘 하루가 쉽지 않았군요. 그래도 하루를 기록하는 것만으로도 대단해요.',
      reflectionQuestions: [
        '오늘 나를 가장 힘들게 한 것은 무엇이었나요?',
        '내일은 어떤 하루가 되면 좋겠나요?',
      ],
      isSafetyAlert: false,
    },
    neutral: {
      primaryEmotion: '평온',
      secondaryEmotions: ['차분함'],
      emotionScore: 0.2,
      summary: '담담하게 하루를 보내셨네요. 때로는 이런 평범한 하루도 소중해요.',
      reflectionQuestions: [
        '오늘 하루 중 기억에 남는 순간이 있나요?',
        '내일 하고 싶은 일이 있나요?',
      ],
      isSafetyAlert: false,
    },
  },
  en: {
    positive: {
      primaryEmotion: 'Contentment',
      secondaryEmotions: ['Anticipation', 'Calm'],
      emotionScore: 0.7,
      summary: "It sounds like you had a fulfilling day. It's great to hold onto these moments.",
      reflectionQuestions: [
        'What was the best moment of your day?',
        'How can you create more moments like this?',
      ],
      isSafetyAlert: false,
    },
    negative: {
      primaryEmotion: 'Exhaustion',
      secondaryEmotions: ['Frustration', 'Disappointment'],
      emotionScore: -0.4,
      summary: "Today wasn't easy. But the fact that you're reflecting on it shows strength.",
      reflectionQuestions: [
        'What was the most challenging part of your day?',
        'What kind of day would you like tomorrow to be?',
      ],
      isSafetyAlert: false,
    },
    neutral: {
      primaryEmotion: 'Calm',
      secondaryEmotions: ['Peaceful'],
      emotionScore: 0.2,
      summary: 'You had a steady day. Sometimes ordinary days are precious too.',
      reflectionQuestions: [
        'Was there a memorable moment today?',
        'Is there something you want to do tomorrow?',
      ],
      isSafetyAlert: false,
    },
  },
  de: {
    positive: {
      primaryEmotion: 'Zufriedenheit',
      secondaryEmotions: ['Vorfreude', 'Ruhe'],
      emotionScore: 0.7,
      summary: 'Es klingt, als hättest du einen erfüllten Tag gehabt. Halte diese Momente fest.',
      reflectionQuestions: [
        'Was war der schönste Moment deines Tages?',
        'Wie kannst du mehr solcher Momente schaffen?',
      ],
      isSafetyAlert: false,
    },
    negative: {
      primaryEmotion: 'Erschöpfung',
      secondaryEmotions: ['Frustration', 'Enttäuschung'],
      emotionScore: -0.4,
      summary: 'Heute war nicht einfach. Aber dass du darüber nachdenkst, zeigt Stärke.',
      reflectionQuestions: [
        'Was war der schwierigste Teil deines Tages?',
        'Wie soll dein morgiger Tag aussehen?',
      ],
      isSafetyAlert: false,
    },
    neutral: {
      primaryEmotion: 'Gelassenheit',
      secondaryEmotions: ['Friedlich'],
      emotionScore: 0.2,
      summary: 'Du hattest einen ruhigen Tag. Manchmal sind gewöhnliche Tage auch wertvoll.',
      reflectionQuestions: [
        'Gab es heute einen besonderen Moment?',
        'Gibt es etwas, das du morgen tun möchtest?',
      ],
      isSafetyAlert: false,
    },
  },
}

// Positive/negative keywords for mock detection
const SENTIMENT_KEYWORDS = {
  positive: ['good', 'great', 'happy', 'joy', 'wonderful', 'amazing', 'love', 'excited', '좋', '행복', '기쁨', '즐거', 'gut', 'toll', 'glücklich', 'freude'],
  negative: ['bad', 'sad', 'angry', 'difficult', 'hard', 'tired', 'stressed', '힘들', '슬픔', '화', '지침', 'schlecht', 'traurig', 'wütend', 'müde'],
}

function getMockResponse(content: string, language: Language): EmotionAnalysis {
  const lowerContent = content.toLowerCase()
  const isPositive = SENTIMENT_KEYWORDS.positive.some((kw) => lowerContent.includes(kw))
  const isNegative = SENTIMENT_KEYWORDS.negative.some((kw) => lowerContent.includes(kw))

  if (isPositive) return MOCK_RESPONSES[language].positive
  if (isNegative) return MOCK_RESPONSES[language].negative
  return MOCK_RESPONSES[language].neutral
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = analyzeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { content, language, model: aiModel } = parsed.data

    // Check for safety alert first
    if (checkSafetyAlert(content)) {
      return NextResponse.json(
        {
          ...SAFETY_RESPONSES[language],
          safetyResources: SAFETY_RESOURCES[language],
        },
        { headers: CORS_HEADERS }
      )
    }

    // Use mock response in development or when API keys are not set
    const hasApiKey = aiModel === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY
    const useMock = process.env.USE_MOCK === 'true' || !hasApiKey

    if (useMock) {
      const mockResponse = getMockResponse(content, language)
      return NextResponse.json(mockResponse, { headers: CORS_HEADERS })
    }

    const languageInstructions: Record<Language, string> = {
      ko: '모든 응답은 한국어로 작성하세요.',
      en: 'Write all responses in English.',
      de: 'Schreibe alle Antworten auf Deutsch.',
    }

    const prompt = `You are an AI that reads and analyzes the emotions in a user's diary.
You are not a therapist, but a supportive friend helping with self-reflection.

${languageInstructions[language]}

User's diary entry:
"""
${content}
"""

Respond ONLY with JSON in the following format (no other text):
{
  "primaryEmotion": "primary emotion (1 word)",
  "secondaryEmotions": ["secondary emotion 1", "secondary emotion 2"],
  "emotionScore": emotion score (-1.0 to 1.0, negative to positive),
  "summary": "one sentence summarizing today's emotions with empathy",
  "reflectionQuestions": ["self-reflection question 1", "question 2"],
  "isSafetyAlert": false
}

Rules:
- Empathize, don't judge
- Don't offer solutions
- Make reflection questions open-ended
- Use specific emotion labels (e.g., 'disappointment' instead of 'sadness')`

    let text: string

    if (aiModel === 'openai') {
      // Use OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      })

      text = completion.choices[0].message.content || ''
    } else {
      // Use Gemini API
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const result = await geminiModel.generateContent(prompt)
      const response = result.response
      text = response.text()
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const analysis = JSON.parse(jsonStr)
    const validated = emotionAnalysisSchema.parse(analysis)

    return NextResponse.json(validated, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to analyze diary', detail: errorMessage },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
