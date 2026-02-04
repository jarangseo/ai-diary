import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">2025년 1월</h1>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          오늘로
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">이번 달 기록</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0일</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">주요 감정</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">-</p>
        </div>
      </div>

      {/* Heatmap Calendar Placeholder */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          <span>일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span>토</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Placeholder calendar cells */}
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-400"
            >
              {i < 31 ? i + 1 : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">첫 기록을 남겨보세요</p>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-4 md:bottom-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/write"
            className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            오늘 일기 쓰기
          </Link>
        </div>
      </div>
    </div>
  )
}
