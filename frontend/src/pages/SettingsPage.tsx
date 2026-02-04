import { useState } from 'react'

export default function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoShowAI, setAutoShowAI] = useState(true)

  const handleExport = (format: 'json' | 'markdown') => {
    // TODO: Implement export
    console.log('Exporting as:', format)
  }

  const handleDeleteAll = () => {
    // TODO: Implement delete with confirmation
    console.log('Delete all data')
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">설정</h1>

      {/* AI Settings */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">AI 기능</h2>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">AI 기능 사용</span>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">AI 결과 자동 표시</span>
          <input
            type="checkbox"
            checked={autoShowAI}
            onChange={(e) => setAutoShowAI(e.target.checked)}
            disabled={!aiEnabled}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
        </label>
      </section>

      {/* Data Management */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">데이터 관리</h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">데이터 내보내기</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('json')}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Markdown
            </button>
          </div>
        </div>

        <hr className="border-gray-100" />

        <button
          onClick={handleDeleteAll}
          className="w-full py-3 px-4 text-red-600 hover:text-red-700 font-medium text-left"
        >
          모든 데이터 삭제
        </button>
      </section>

      {/* Notices */}
      <section className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-3">
        <h2 className="font-semibold text-amber-900">안내</h2>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>본 서비스는 의료 상담이 아닙니다.</li>
          <li>일기 원문은 기본적으로 기기 내에 저장됩니다.</li>
          <li>AI 분석은 사용자 요청 시에만 서버로 전송되며, 분석 후 텍스트는 저장되지 않습니다.</li>
        </ul>
      </section>
    </div>
  )
}
