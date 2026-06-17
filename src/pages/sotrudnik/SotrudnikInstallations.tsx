import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { installationsApi } from '@/api/installations'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import {
  INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
} from '@/types'
import type { InstallationStatus, PaymentStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const initialForm = {
  store_id: '',
  status: 'installed' as InstallationStatus,
  notes: '',
  amount_paid: 0,
  debt_amount: 0,
  debt_due_date: '',
  payment_status: 'unpaid' as PaymentStatus,
  latitude: null as number | null,
  longitude: null as number | null,
}

function AddInstallationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { position, getPosition, loading: geoLoading } = useGeolocation()
  const [form, setForm] = useState(initialForm)
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
        debt_due_date: form.debt_due_date || null,
        sotrudnik_id: user!.id,
        visit_id: null,
        installed_at: new Date().toISOString(),
      })
      toast.success("O'rnatish saqlandi")
      qc.invalidateQueries({ queryKey: ['my-installations'] })
      onClose()
      setForm(initialForm)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi O'rnatish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Magazin *</label>
          <select value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="">Tanlang</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.store_name} — {s.company_name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">O'rnatish holati *</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InstallationStatus })}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            {Object.entries(INSTALLATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* To'lov bo'limi */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-900/40">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">💰 To'lov ma'lumotlari</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To'lov holati *</label>
            <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value as PaymentStatus })}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
              {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="To'langan summa"
              type="number"
              min={0}
              value={form.amount_paid}
              onChange={e => setForm({ ...form, amount_paid: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
            {(form.payment_status === 'debt' || form.payment_status === 'partial') && (
              <Input
                label="Qarz summasi"
                type="number"
                min={0}
                value={form.debt_amount}
                onChange={e => setForm({ ...form, debt_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            )}
          </div>

          {(form.payment_status === 'debt' || form.payment_status === 'partial') && (
            <Input
              label="Qarz qaytarish sanasi"
              type="date"
              value={form.debt_due_date}
              onChange={e => setForm({ ...form, debt_due_date: e.target.value })}
            />
          )}
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

  const totalCollected = installations.reduce((sum, i) => sum + (i.amount_paid || 0), 0)
  const totalDebt = installations.reduce((sum, i) => sum + (i.debt_amount || 0), 0)

  return (
    <Layout title="Mening O'rnatishlarim">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-xs text-green-700 dark:text-green-400">Jami yig'ilgan</p>
            <p className="text-xl font-bold text-green-600">{totalCollected.toLocaleString()} so'm</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <p className="text-xs text-red-700 dark:text-red-400">Jami qarz</p>
            <p className="text-xl font-bold text-red-600">{totalDebt.toLocaleString()} so'm</p>
          </div>
        </div>

        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Barcha holatlar</option>
            {Object.entries(INSTALLATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
            O'rnatish qo'shish
          </Button>
        </div>

        <Table headers={['Magazin', 'Holat', "To'lov", 'Summa', 'Qarz', 'Vaqt']}>
          {isLoading ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
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
                <Td>
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{ background: PAYMENT_STATUS_COLORS[inst.payment_status] + '20', color: PAYMENT_STATUS_COLORS[inst.payment_status] }}>
                    {PAYMENT_STATUS_LABELS[inst.payment_status]}
                  </span>
                </Td>
                <Td className="text-sm">{inst.amount_paid?.toLocaleString() || 0} so'm</Td>
                <Td className="text-sm">
                  {inst.debt_amount > 0 ? (
                    <span className="text-red-500">
                      {inst.debt_amount.toLocaleString()} so'm
                      {inst.debt_due_date && <span className="block text-xs text-slate-400">⏰ {formatDate(inst.debt_due_date, 'dd.MM.yyyy')}</span>}
                    </span>
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