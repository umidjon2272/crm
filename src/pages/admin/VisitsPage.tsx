import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select, Textarea } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { visitsApi } from '@/api/visits'
import { sellersApi } from '@/api/sellers'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import { VISIT_STATUS_LABELS } from '@/types'
import type { VisitStatus, FilterParams } from '@/types'
import toast from 'react-hot-toast'

function AddVisitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState({ store_id: '', status: 'bought' as VisitStatus, notes: '' })
  const [loading, setLoading] = useState(false)

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_id) { toast.error("Magazin tanlang"); return }
    setLoading(true)
    try {
      await visitsApi.create({
        ...form,
        seller_id: user!.id,
        visited_at: new Date().toISOString(),
        latitude: null,
        longitude: null,
      })
      toast.success("Tashrif saqlandi")
      qc.invalidateQueries({ queryKey: ['visits'] })
      onClose()
      setForm({ store_id: '', status: 'bought', notes: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi Tashrif Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Magazin *</label>
          <select value={form.store_id} onChange={e => setForm({...form, store_id: e.target.value})} required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="">Tanlang</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.store_name} — {s.company_name}</option>)}
          </select>
        </div>
        <Select label="Holat *" value={form.status} onChange={e => setForm({...form, status: e.target.value as VisitStatus})}>
          {Object.entries(VISIT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Textarea label="Izoh" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Qo'shimcha izoh..." />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">Saqlash</Button>
        </div>
      </form>
    </Modal>
  )
}

export function AdminVisitsPage() {
  const [filters, setFilters] = useState<FilterParams>({})
  const [showAdd, setShowAdd] = useState(false)

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitsApi.getAll(filters),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  return (
    <Layout title="Tashriflar">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 mr-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Boshlanish</label>
              <input type="date" value={filters.startDate || ''} onChange={e => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tugash</label>
              <input type="date" value={filters.endDate || ''} onChange={e => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sotuvchi</label>
              <select value={filters.sellerId || ''} onChange={e => setFilters({...filters, sellerId: e.target.value || undefined})}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Barchasi</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Holat</label>
              <select value={filters.status || ''} onChange={e => setFilters({...filters, status: (e.target.value as VisitStatus) || undefined})}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Barchasi</option>
                {Object.entries(VISIT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Qo'shish</Button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{visits.length} ta tashrif</p>
          <button onClick={() => setFilters({})} className="text-sm text-blue-600 hover:underline">Tozalash</button>
        </div>

        <Table headers={['Magazin', 'Sotuvchi', 'Holat', 'Izoh', 'GPS', 'Vaqt']}>
          {isLoading ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : visits.length === 0 ? <EmptyState /> : (
            visits.map(visit => (
              <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{visit.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{visit.store?.company_name}</p>
                  </div>
                </Td>
                <Td><p className="font-medium">{visit.seller?.first_name} {visit.seller?.last_name}</p></Td>
                <Td><VisitStatusBadge status={visit.status as VisitStatus} /></Td>
                <Td className="max-w-xs"><p className="truncate text-slate-500 text-xs">{visit.notes || '—'}</p></Td>
                <Td>
                  {visit.latitude ? (
                    <a href={`https://maps.google.com/?q=${visit.latitude},${visit.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">📍 Ko'rish</a>
                  ) : '—'}
                </Td>
                <Td className="whitespace-nowrap">{formatDate(visit.visited_at)}</Td>
              </tr>
            ))
          )}
        </Table>
      </div>
      <AddVisitModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}