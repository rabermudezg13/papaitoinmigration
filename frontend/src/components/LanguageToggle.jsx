import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { t, i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/20 transition"
    >
      <span className="text-base">{i18n.language === 'en' ? '🇲🇽' : '🇺🇸'}</span>
      {t('lang.toggle')}
    </button>
  )
}
