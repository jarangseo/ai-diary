import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useTranslation } from '../hooks/useTranslation'
import { getAllDiaries } from '../services/db'
import type { Diary } from '../types/diary'

// Get emotion color based on score (-1 to 1)
function getEmotionColor(score: number | undefined): { bg: string; hover: string } {
  if (score === undefined) {
    return { bg: 'bg-gray-300', hover: 'hover:bg-gray-400' }
  }
  if (score <= -0.6) {
    return { bg: 'bg-indigo-400', hover: 'hover:bg-indigo-500' }
  }
  if (score <= -0.2) {
    return { bg: 'bg-blue-300', hover: 'hover:bg-blue-400' }
  }
  if (score <= 0.2) {
    return { bg: 'bg-gray-300', hover: 'hover:bg-gray-400' }
  }
  if (score <= 0.6) {
    return { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-400' }
  }
  return { bg: 'bg-orange-300', hover: 'hover:bg-orange-400' }
}

// Hex color for chart dots and gradient
function getEmotionHex(score: number): string {
  if (score <= -0.6) return '#818CF8' // indigo-400
  if (score <= -0.2) return '#93C5FD' // blue-300
  if (score <= 0.2) return '#D1D5DB'  // gray-300
  if (score <= 0.6) return '#FDE047'  // yellow-300
  return '#FDBA74'                     // orange-300
}

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

  // Create a map of days to their diary data (including emotion score)
  const diaryByDay = new Map(
    currentMonthDiaries.map((diary) => [new Date(diary.date).getDate(), diary])
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
    const diary = diaryByDay.get(day)
    calendarCells.push({
      day,
      key: dateStr,
      date: dateStr,
      hasDiary: !!diary,
      emotionScore: diary?.emotion?.score,
    })
  }

  // Generate chart data (only days with emotion scores)
  const chartData = currentMonthDiaries
    .filter((diary) => diary.emotion?.score !== undefined)
    .map((diary) => ({
      day: new Date(diary.date).getDate(),
      score: diary.emotion!.score,
      emotion: diary.emotion!.primary,
    }))
    .sort((a, b) => a.day - b.day)

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
          {calendarCells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} className="aspect-square" />
            }
            const emotionColor = getEmotionColor(cell.emotionScore)
            return (
              <Link
                key={cell.key}
                to={cell.hasDiary ? `/diary/${cell.date}` : `/write/${cell.date}`}
                className={`aspect-square rounded-md flex items-center justify-center text-sm transition-colors ${
                  cell.hasDiary
                    ? `${emotionColor.bg} text-white ${emotionColor.hover}`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cell.day}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Emotion Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">{t('emotionTrend')}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="emotionGradient" x1="0" y1="0" x2="1" y2="0">
                    {chartData.map((d, i) => (
                      <stop
                        key={i}
                        offset={chartData.length > 1 ? `${(i / (chartData.length - 1)) * 100}%` : '50%'}
                        stopColor={getEmotionHex(d.score)}
                      />
                    ))}
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  domain={[-1, 1]}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const color = getEmotionHex(data.score)
                      return (
                        <div
                          className="rounded-lg p-2 shadow-lg border"
                          style={{ backgroundColor: color, borderColor: color }}
                        >
                          <p className="text-sm font-bold text-white drop-shadow-sm">{data.emotion}</p>
                          <p className="text-xs text-white/80 drop-shadow-sm">
                            {t('emotionScore')}: {data.score.toFixed(2)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#emotionGradient)"
                  strokeWidth={2}
                  dot={(props: { cx?: number; cy?: number; payload?: { score: number } }) => {
                    if (props.cx == null || props.cy == null || !props.payload) return <></>
                    const color = getEmotionHex(props.payload.score)
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={(props: { cx?: number; cy?: number; payload?: { score: number } }) => {
                    if (props.cx == null || props.cy == null || !props.payload) return <></>
                    const color = getEmotionHex(props.payload.score)
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={7}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
