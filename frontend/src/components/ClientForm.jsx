import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const PROCESS_TYPES = ['asylum', 'visa', 'green_card', 'naturalization', 'student_visa', 'other']

export default function ClientForm() {
  const { t, i18n } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await axios.post('/api/clients', {
        ...data,
        preferred_language: i18n.language,
      })
      setSubmitted(true)
    } catch {
      setServerError(t('form.errorMsg'))
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center bg-white rounded-2xl shadow-lg p-10">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">{t('form.successTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('form.successMsg')}</p>
        <button
          onClick={() => { setSubmitted(false); reset() }}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {t('form.newForm')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-primary-800 mb-1">{t('form.title')}</h2>
      <p className="text-gray-500 mb-6 text-sm">{t('form.subtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.firstName')} *</label>
            <input
              {...register('first_name', { required: t('form.required') })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.lastName')} *</label>
            <input
              {...register('last_name', { required: t('form.required') })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.email')} *</label>
          <input
            type="email"
            {...register('email', {
              required: t('form.required'),
              pattern: { value: /^\S+@\S+\.\S+$/, message: t('form.invalidEmail') },
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone + Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.phone')}</label>
            <input
              {...register('phone')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.country')}</label>
            <input
              {...register('country_of_origin')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Process type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.processType')} *</label>
          <select
            {...register('process_type', { required: t('form.required') })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">{t('form.selectProcess')}</option>
            {PROCESS_TYPES.map((pt) => (
              <option key={pt} value={pt}>{t(`form.processTypes.${pt}`)}</option>
            ))}
          </select>
          {errors.process_type && <p className="text-red-500 text-xs mt-1">{errors.process_type.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.description')}</label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder={t('form.descriptionHint')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          />
        </div>

        {serverError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
        >
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>
    </div>
  )
}
