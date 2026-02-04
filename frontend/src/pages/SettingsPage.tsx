import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguageStore } from '../stores/languageStore'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguageStore()
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoShowAI, setAutoShowAI] = useState(true)

  const noticeItems = t('noticeItems') as string[]

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
      <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>

      {/* Language Settings */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">{t('language')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('english')}
          </button>
          <button
            onClick={() => setLanguage('ko')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              language === 'ko'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('korean')}
          </button>
          <button
            onClick={() => setLanguage('de')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              language === 'de'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('german')}
          </button>
        </div>
      </section>

      {/* AI Settings */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">{t('aiFeatures')}</h2>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">{t('useAIFeatures')}</span>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">{t('autoShowAIResults')}</span>
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
        <h2 className="font-semibold text-gray-900">{t('dataManagement')}</h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">{t('exportData')}</p>
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
          {t('deleteAllData')}
        </button>
      </section>

      {/* Notices */}
      <section className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-3">
        <h2 className="font-semibold text-amber-900">{t('notices')}</h2>
        <ul className="text-sm text-amber-800 space-y-2">
          {noticeItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
