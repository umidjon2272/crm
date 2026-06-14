import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select, Textarea } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { visitsApi } from '@/api/visits'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatDate } from '@/lib/utils'
import { VISIT_STATUS_LABELS } from '@/types'
import type { VisitStatus } from '@/types'
import toast from 'react-hot-toast'

function AddVisitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { position, getPosition, loading: geoLoading } = useGeolocation()
  const [form, setForm] = useState({
    store_id: '',
    status: 'bought' as VisitStatus,
    notes: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [submitting, setSubmitting] = useState(false)

  const { data: stores = [] } = useQuery({
    queryKey: ['my-stores', user?.id],
    queryFn: () => storesApi.getMine(user!.id),
    enabled: !!user,
  })

  React.useEffect(() => {
    if (position) {
      setForm((f) => ({ ...f, latitude: position.latitude, longitude: position.longitude }))
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_id) { toast.error('Magazin tanlanishi shart'); return }
    setSubmitting(true)
    try {
      await visitsApi.create({
        ...form,
        seller_id: user!.id,
        visited_at: new Date().toISOString(),
      })
      toast.success('Tashrif saqlandi')
      qc.invalidateQueries({ queryKey: ['my-visits'] })
      onClose()
      setForm({ store_id: '', status: 'bought', notes: '', latitude: null, longitude: null })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi Tashrif Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Magazin *"
          value={form.store_id}
          onChange={(e) => setForm({ ...form, store_id: e.target.value })}
          required
        >
          <option value="">Magazin tanlang</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.store_name} - {s.company_name}</option>
          ))}
        </Select>

        <Select
          label="Holat *"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as VisitStatus })}
        >
          {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>

        <Textarea
          label="Izoh"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Qo'shimcha izoh (ixtiyoriy)..."
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GPS Lokatsiya</label>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" isLoading={geoLoading} onClick={getPosition} leftIcon={<MapPin className="w-4 h-4" />} size="sm">
              Lokatsiyani olish
            </Button>
            {form.latitude && (
              <span className="text-xs text-green-600 font-medium">✓ GPS olindi</span>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={submitting} className="flex-1">Saqlash</Button>
        </div>
      </form>
    </Modal>
  )
}

export function SellerVisitsPage() {
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: () => visitsApi.getMine(user!.id),
    enabled: !!user,
  })

  const filtered = visits.filter((v) => !statusFilter || v.status === statusFilter)

  return (
    <Layout title="Mening Tashriflarim">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="">Barcha holatlar</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
            Tashrif qo'shish
          </Button>
        </div>

        <Table headers={['Magazin', 'Holat', 'Izoh', 'Joylashuv', 'Vaqt']}>
          {isLoading ? (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? (
            <EmptyState message="Hali tashrif yo'q" />
          ) : (
            filtered.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Td>
                  <div>
                    <p className="font-medium">{v.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{v.store?.company_name}</p>
                  </div>
                </Td>
                <Td><VisitStatusBadge status={v.status as VisitStatus} /></Td>
                <Td><p className="text-xs text-slate-500 truncate max-w-xs">{v.notes || '—'}</p></Td>
                <Td>
                  {v.latitude ? (
                    <a href={`https://maps.google.com/?q=${v.latitude},${v.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline">📍 Ko'rish</a>
                  ) : '—'}
                </Td>
                <Td className="whitespace-nowrap text-xs">{formatDate(v.visited_at)}</Td>
              </tr>
            ))
          )}
        </Table>
      </div>
      <AddVisitModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}
