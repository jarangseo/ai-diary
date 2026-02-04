import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import { getAllDiaries } from '../services/db'
import type { Diary } from '../types/diary'

export default function HomePage() {
  const { t, formatMonthYear } = useTranslation()
  const weekdays = t('weekdays') as string[]
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    getAllDiaries().then(setDiaries)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Filter diaries for current month
  const currentMonthDiaries = diaries.filter((diary) => {
    const diaryDate = new Date(diary.date)
    return diaryDate.getFullYear() === year && diaryDate.getMonth() === month
  })

  // Create a set of days that have diary entries
  const daysWithDiary = new Set(
    currentMonthDiaries.map((diary) => new Date(diary.date).getDate())
  )

  // Calculate main emotion (most frequent)
  const emotionCounts = currentMonthDiaries.reduce(
    (acc, diary) => {
      if (diary.emotion?.primary) {
        acc[diary.emotion.primary] = (acc[diary.emotion.primary] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )
  const mainEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Generate calendar cells
  const calendarCells = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ day: null, key: `empty-${i}` })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    calendarCells.push({ day, key: dateStr, date: dateStr, hasDiary: daysWithDiary.has(day) })
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {formatMonthYear(currentDate)}
          </h1>
          <button
            onClick={goToNextMonth}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {t('today')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t('monthRecords')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {currentMonthDiaries.length} {t('days')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{t('mainEmotion')}</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {mainEmotion || t('noData')}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell) => (
            cell.day === null ? (
              <div key={cell.key} className="aspect-square" />
            ) : (
              <Link
                key={cell.key}
                to={cell.hasDiary ? `/diary/${cell.date}` : `/write/${cell.date}`}
                className={`aspect-square rounded-md flex items-center justify-center text-sm transition-colors ${
                  cell.hasDiary
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cell.day}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Empty State */}
      {diaries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{t('emptyStateMessage')}</p>
        </div>
      )}

      {/* Floating CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 md:bottom-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/write"
            className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            {t('writeTodayDiary')}
          </Link>
        </div>
      </div>
    </div>
  )
}
