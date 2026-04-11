import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import AdminLogin from './AdminLogin'

const PROCESS_TYPES = ['asylum', 'visa', 'green_card', 'naturalization', 'student_visa', 'other']
const STATUSES = ['pending', 'in_review', 'completed', 'closed']

function DetailModal({ client, token, onClose, onSaved }) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState(client.notes || '')
  const [status, setStatus] = useState(client.status || 'pending')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await axios.patch(`/api/clients/${client.id}`, { notes, status }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-primary-800">{t('admin.detail.title')}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          <div className="space-y-3 text-sm mb-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.name')}</span>
              <span>{client.first_name} {client.last_name}</span>
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.email')}</span>
              <span>{client.email}</span>
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.phone')}</span>
              <span>{client.phone || '—'}</span>
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.country')}</span>
              <span>{client.country_of_origin || '—'}</span>
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.process')}</span>
              <span>{t(`form.processTypes.${client.process_type}`)}</span>
              <span className="font-medium text-gray-500">{t('admin.detail.language')}</span>
              <span>{client.preferred_language === 'es' ? 'Español' : 'English'}</span>
              <span className="font-medium text-gray-500">{t('admin.tableHeaders.date')}</span>
              <span>{new Date(client.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {client.description && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">{t('admin.detail.description')}</p>
              <p className="text-sm bg-gray-50 rounded-lg p-3 border border-gray-200 whitespace-pre-wrap">{client.description}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.detail.status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`admin.statuses.${s}`)}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.detail.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={t('admin.detail.notesPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition text-sm disabled:opacity-60"
            >
              {saved ? t('admin.detail.saved') : saving ? t('admin.detail.saving') : t('admin.detail.save')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              {t('admin.detail.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
}

export default function AdminPanel() {
  const { t } = useTranslation()
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterProcess, setFilterProcess] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchClients = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = {}
      if (filterProcess) params.process_type = filterProcess
      if (filterStatus) params.status = filterStatus
      if (search) params.search = search
      const res = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      setClients(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_token')
        setToken('')
      }
    } finally {
      setLoading(false)
    }
  }, [token, filterProcess, filterStatus, search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken('')
    setClients([])
  }

  if (!token) {
    return <AdminLogin onLogin={(t) => setToken(t)} />
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">{t('admin.title')}</h2>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          {t('admin.logout')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.searchPlaceholder')}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterProcess}
          onChange={(e) => setFilterProcess(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('admin.allProcesses')}</option>
          {PROCESS_TYPES.map((pt) => (
            <option key={pt} value={pt}>{t(`form.processTypes.${pt}`)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('admin.allStatuses')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`admin.statuses.${s}`)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center text-gray-400">{t('admin.noResults')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-800 text-white">
                <tr>
                  {['name', 'email', 'phone', 'country', 'process', 'status', 'date', 'actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{t(`admin.tableHeaders.${h}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{c.first_name} {c.last_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.country_of_origin || '—'}</td>
                    <td className="px-4 py-3">{t(`form.processTypes.${c.process_type}`)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || STATUS_COLORS.pending}`}>
                        {t(`admin.statuses.${c.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(c)}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          client={selected}
          token={token}
          onClose={() => setSelected(null)}
          onSaved={fetchClients}
        />
      )}
    </div>
  )
}
