import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDiary, deleteDiary } from '../services/db'
import { useTranslation } from '../hooks/useTranslation'
import type { Diary } from '../types/diary'

export default function DiaryDetailPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()
  const [diary, setDiary] = useState<Diary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const formattedDate = date ? formatDate(date) : ''

  useEffect(() => {
    if (!date) return

    let cancelled = false
    getDiary(date).then((data) => {
      if (!cancelled) {
        setDiary(data ?? null)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [date])

  const handleDelete = async () => {
    if (!date || !confirm(t('confirmDelete') as string)) return

    await deleteDiary(date)
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  if (!diary) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('noDiaryFound')}</p>
          <Link
            to={`/write/${date}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('writeDiary')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
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
        <button className="p-2 -mr-2 text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {/* Date */}
      <h1 className="text-xl font-semibold text-gray-900">{formattedDate}</h1>

      {/* Emotion Badge (if available) */}
      {diary.emotion && (
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {diary.emotion.primary}
          </span>
          <span className="text-sm text-gray-500">
            {t('emotionScore')}: {diary.emotion.score.toFixed(1)}
          </span>
        </div>
      )}

      {/* Diary Content */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {diary.content}
        </p>
      </div>

      {/* AI Feedback Card (if available) */}
      {diary.emotion ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{t('aiFeedback')}</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              {t('hide')}
            </button>
          </div>
          <p className="text-gray-700 mb-4">{diary.emotion.summary}</p>
          {diary.emotion.questions && diary.emotion.questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t('reflectionQuestions')}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {diary.emotion.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        !diary.isRecordOnly && (
          <div className="text-center py-4">
            <Link
              to={`/write/${date}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('getAIFeedback')}
            </Link>
          </div>
        )
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/write/${date}`}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          {t('edit')}
        </Link>
        <button
          onClick={handleDelete}
          className="py-3 px-4 text-red-600 hover:text-red-700 font-medium"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  )
}
