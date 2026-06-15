import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { installationsApi } from '@/api/installations'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/types'
import type { InstallationStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function AddInstallationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { position, getPosition, loading: geoLoading } = useGeolocation()
  const [form, setForm] = useState({
    store_id: '',
    status: 'installed' as InstallationStatus,
    notes: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [loading, setLoading] = useState(false)

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
  })

  useEffect(() => {
    if (position) {
      setForm(f => ({ ...f, latitude: position.latitude, longitude: position.longitude }))
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_id) { toast.error("Magazin tanlang"); return }
    setLoading(true)
    try {
      await installationsApi.create({
        ...form,
        sotrudnik_id: user!.id,
        visit_id: null,
        installed_at: new Date().toISOString(),
      })
      toast.success("O'rnatish saqlandi")
      qc.invalidateQueries({ queryKey: ['my-installations'] })
      onClose()
      setForm({ store_id: '', status: 'installed', notes: '', latitude: null, longitude: null })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi O'rnatish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Magazin *</label>
          <select value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="">Tanlang</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.store_name} — {s.company_name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Holat *</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InstallationStatus })}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            {Object.entries(INSTALLATION_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <Textarea label="Izoh" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Qo'shimcha izoh..." />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GPS Lokatsiya</label>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" size="sm" isLoading={geoLoading} onClick={getPosition} leftIcon={<MapPin className="w-4 h-4" />}>
              Lokatsiyani olish
            </Button>
            {form.latitude && <span className="text-xs text-green-600 font-medium">✓ GPS olindi</span>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">Saqlash</Button>
        </div>
      </form>
    </Modal>
  )
}

export function SotrudnikInstallations() {
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { data: installations = [], isLoading } = useQuery({
    queryKey: ['my-installations', user?.id],
    queryFn: () => installationsApi.getMine(user!.id),
    enabled: !!user,
  })

  const filtered = installations.filter(i => !statusFilter || i.status === statusFilter)

  return (
    <Layout title="Mening O'rnatishlarim">
      <div className="space-y-4">
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Barcha holatlar</option>
            {Object.entries(INSTALLATION_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
            O'rnatish qo'shish
          </Button>
        </div>

        <Table headers={['Magazin', 'Holat', 'Izoh', 'GPS', 'Vaqt']}>
          {isLoading ? (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? (
            <EmptyState message="Hali o'rnatish yo'q" />
          ) : (
            filtered.map(inst => (
              <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Td>
                  <p className="font-medium">{inst.store?.store_name}</p>
                  <p className="text-xs text-slate-400">{inst.store?.company_name}</p>
                </Td>
                <Td>
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{ background: INSTALLATION_STATUS_COLORS[inst.status] + '20', color: INSTALLATION_STATUS_COLORS[inst.status] }}>
                    {INSTALLATION_STATUS_LABELS[inst.status]}
                  </span>
                </Td>
                <Td><p className="text-xs text-slate-500 truncate max-w-xs">{inst.notes || '—'}</p></Td>
                <Td>
                  {inst.latitude ? (
                    <a href={`https://maps.google.com/?q=${inst.latitude},${inst.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline">📍 Ko'rish</a>
                  ) : '—'}
                </Td>
                <Td className="whitespace-nowrap text-xs">{formatDate(inst.installed_at)}</Td>
              </tr>
            ))
          )}
        </Table>
      </div>
      <AddInstallationModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}