import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { saveDiary, getDiary } from '../services/db'
import { useTranslation } from '../hooks/useTranslation'

export default function DiaryWritePage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()
  const [content, setContent] = useState('')
  const [isRecordOnly, setIsRecordOnly] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const today = date || new Date().toISOString().split('T')[0]
  const formattedDate = formatDate(today)

  useEffect(() => {
    getDiary(today).then((diary) => {
      if (diary) {
        setContent(diary.content)
        setIsRecordOnly(diary.isRecordOnly)
      }
    })
  }, [today])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveDiary(today, content, isRecordOnly)
      navigate(-1)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestAI = async () => {
    setIsSaving(true)
    try {
      await saveDiary(today, content, isRecordOnly)
      // TODO: Request AI analysis
      console.log('Requesting AI analysis')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-gray-500">
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
          disabled={isSaving}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {t('save')}
        </button>
        {!isRecordOnly && (
          <button
            onClick={handleRequestAI}
            disabled={!content.trim() || isSaving}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('getAIFeedback')}
          </button>
        )}
      </div>

      {/* AI Feedback Placeholder */}
      {/* TODO: Show AI feedback card when available */}
    </div>
  )
}
