import { useParams, useNavigate, Link } from 'react-router-dom'

export default function DiaryDetailPage() {
  const { date } = useParams()
  const navigate = useNavigate()

  const formattedDate = date
    ? new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : ''

  // TODO: Load diary from IndexedDB
  const diary = {
    content: '오늘은 좋은 하루였다...',
    emotion: null as null | {
      primary: string
      score: number
      summary: string
    },
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
            감정 점수: {diary.emotion.score.toFixed(1)}
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
            <h3 className="font-medium text-gray-900">AI 피드백</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              숨기기
            </button>
          </div>
          <p className="text-gray-700 mb-4">{diary.emotion.summary}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">성찰 질문:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>오늘 가장 기억에 남는 순간은 무엇인가요?</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            AI 피드백 받기
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/write/${date}`}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          편집
        </Link>
        <button className="py-3 px-4 text-red-600 hover:text-red-700 font-medium">
          삭제
        </button>
      </div>
    </div>
  )
}
