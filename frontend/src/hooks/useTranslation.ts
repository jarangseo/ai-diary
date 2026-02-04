import { useLanguageStore } from '../stores/languageStore'
import { translations, type TranslationKey } from '../constants/translations'

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)

  const t = (key: TranslationKey): string | readonly string[] => {
    return translations[language][key]
  }

  const getLocale = () => {
    switch (language) {
      case 'ko': return 'ko-KR'
      case 'de': return 'de-DE'
      default: return 'en-US'
    }
  }

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const formatMonthYear = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'long',
    })
  }

  return { t, language, formatDate, formatMonthYear }
}
