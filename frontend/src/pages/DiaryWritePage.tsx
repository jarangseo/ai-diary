import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type AnalyzeResponse } from '../services/api'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsStore } from '../stores/settingsStore'
import { useDiary, useSaveDiary, useAnalyzeDiary } from '../hooks/useDiaries'

export default function DiaryWritePage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { t, formatDate, language } = useTranslation()
  const aiModel = useSettingsStore((state) => state.aiModel)
  const [content, setContent] = useState('')
  const [isRecordOnly, setIsRecordOnly] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const today = date || new Date().toISOString().split('T')[0]
  const formattedDate = formatDate(today)

  const { data: existingDiary } = useDiary(today)
  const saveMutation = useSaveDiary()
  const analyzeMutation = useAnalyzeDiary()

  const isSaving = saveMutation.isPending
  const isAnalyzing = analyzeMutation.isPending

  // Sync form state from fetched diary (render-time state adjustment)
  const [syncedDiary, setSyncedDiary] = useState(existingDiary)
  if (existingDiary !== syncedDiary) {
    setSyncedDiary(existingDiary)
    if (existingDiary) {
      setContent(existingDiary.content)
      setIsRecordOnly(existingDiary.isRecordOnly)
      if (existingDiary.emotion) {
        setAnalysisResult({
          primaryEmotion: existingDiary.emotion.primary,
          secondaryEmotions: [],
          emotionScore: existingDiary.emotion.score,
          summary: existingDiary.emotion.summary,
          reflectionQuestions: existingDiary.emotion.questions || [],
          isSafetyAlert: false,
        })
      }
    }
  }

  const handleSave = () => {
    saveMutation.mutate(
      { date: today, content, isRecordOnly },
      { onSuccess: () => navigate(-1) }
    )
  }

  const handleRequestAI = async () => {
    setError(null)
    try {
      await saveMutation.mutateAsync({ date: today, content, isRecordOnly })
      const result = await analyzeMutation.mutateAsync({
        date: today,
        content,
        language,
        aiModel,
      })
      setAnalysisResult(result)
    } catch {
      setError(t('analysisError') as string)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-gray-500" role="status" aria-live="polite">
          {isSaving ? t('saving') : t('autoSaved')}
        </span>
      </div>

      {/* Date */}
      <h1 className="text-xl font-semibold text-gray-900">{formattedDate}</h1>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('howWasYourDay') as string}
        aria-label="Diary content"
        className="w-full h-64 p-4 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Options */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecordOnly}
          onChange={(e) => setIsRecordOnly(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-700">{t('recordOnly')}</span>
      </label>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || isAnalyzing}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {t('save')}
        </button>
        {!isRecordOnly && (
          <button
            onClick={handleRequestAI}
            disabled={!content.trim() || isSaving || isAnalyzing}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? t('analyzing') : t('getAIFeedback')}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Safety Alert */}
      {analysisResult?.isSafetyAlert && analysisResult.safetyResources && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <h3 className="font-semibold text-amber-900">{t('safetyAlertTitle')}</h3>
          <p className="text-amber-800">{analysisResult.safetyResources.message}</p>
          <div className="space-y-2">
            {analysisResult.safetyResources.resources.map((resource, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-amber-800">{resource.name}</span>
                <a
                  href={`tel:${resource.number}`}
                  className="text-amber-900 font-semibold hover:underline"
                >
                  {resource.number}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback Card */}
      {analysisResult && !analysisResult.isSafetyAlert && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{t('aiFeedback')}</h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {analysisResult.primaryEmotion}
              </span>
              <span className="text-sm text-gray-500">
                {analysisResult.emotionScore.toFixed(1)}
              </span>
            </div>
          </div>

          <p className="text-gray-700">{analysisResult.summary}</p>

          {analysisResult.reflectionQuestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t('reflectionQuestions')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {analysisResult.reflectionQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
