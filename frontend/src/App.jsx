import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ClientForm from './components/ClientForm'
import AdminPanel from './components/AdminPanel'
import LanguageToggle from './components/LanguageToggle'

export default function App() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('register')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Immigration Law Services</h1>
              <p className="text-primary-200 text-xs">Servicios de Inmigración</p>
            </div>
          </div>
          <LanguageToggle />
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          <button
            onClick={() => setTab('register')}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${
              tab === 'register'
                ? 'bg-gray-50 text-primary-800'
                : 'text-primary-100 hover:bg-primary-700'
            }`}
          >
            {t('nav.register')}
          </button>
          <button
            onClick={() => setTab('admin')}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${
              tab === 'admin'
                ? 'bg-gray-50 text-primary-800'
                : 'text-primary-100 hover:bg-primary-700'
            }`}
          >
            {t('nav.admin')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {tab === 'register' ? <ClientForm /> : <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200">
        Hecho por <span className="font-semibold text-gray-500">Cafe Cultura LLC</span>
      </footer>
    </div>
  )
}
