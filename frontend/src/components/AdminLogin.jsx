import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

export default function AdminLogin({ onLogin }) {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    try {
      const res = await axios.post('/api/auth/login', data)
      localStorage.setItem('admin_token', res.data.access_token)
      onLogin(res.data.access_token)
    } catch (err) {
      if (err.response?.status === 401) {
        setError(t('admin.invalidCredentials'))
      } else {
        setError(t('admin.loginError'))
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">⚖️</div>
        <h2 className="text-xl font-bold text-primary-800">{t('admin.loginTitle')}</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.username')}</label>
          <input
            {...register('username', { required: true })}
            autoComplete="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.password')}</label>
          <input
            type="password"
            {...register('password', { required: true })}
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
        >
          {isSubmitting ? '...' : t('admin.login')}
        </button>
      </form>
    </div>
  )
}
