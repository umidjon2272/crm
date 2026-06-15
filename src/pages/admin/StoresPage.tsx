import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Store as StoreIcon, MapPin, Trash2, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { storesApi } from '@/api/stores'
import { sellersApi } from '@/api/sellers'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Store } from '@/types'

function StoreModal({ isOpen, onClose, store }: { isOpen: boolean; onClose: () => void; store?: Store }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data: sellers = [] } = useQuery({ queryKey: ['sellers'], queryFn: sellersApi.getAll })
  const [form, setForm] = useState({
    store_name: store?.store_name || '',
    company_name: store?.company_name || '',
    phone: store?.phone || '',
    contact_person: store?.contact_person || '',
    address: store?.address || '',
    notes: store?.notes || '',
    seller_id: store?.seller_id || '',
    latitude: store?.latitude || null as number | null,
    longitude: store?.longitude || null as number | null,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_name || !form.company_name) { toast.error("Majburiy maydonlarni to'ldiring"); return }
    setLoading(true)
    try {
      if (store) {
        await storesApi.update(store.id, form, user!.id)
        toast.success("Magazin yangilandi")
      } else {
        await storesApi.create({ ...form, seller_id: form.seller_id || user!.id }, user!.id)
        toast.success("Magazin qo'shildi")
      }
      qc.invalidateQueries({ queryKey: ['stores'] })
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={store ? "Magazinni tahrirlash" : "Yangi Magazin"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Magazin nomi *" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})} required />
          <Input label="Firma nomi *" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Telefon" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Mas'ul shaxs" value={form.contact_person || ''} onChange={e => setForm({...form, contact_person: e.target.value})} />
        </div>
        <Input label="Manzil" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
        <Textarea label="Izoh" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sotuvchi</label>
          <select value={form.seller_id} onChange={e => setForm({...form, seller_id: e.target.value})}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="">Tanlang</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitude" type="number" step="any" value={form.latitude || ''} onChange={e => setForm({...form, latitude: parseFloat(e.target.value) || null})} placeholder="41.2995" />
          <Input label="Longitude" type="number" step="any" value={form.longitude || ''} onChange={e => setForm({...form, longitude: parseFloat(e.target.value) || null})} placeholder="69.2401" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{store ? 'Saqlash' : "Qo'shish"}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function AdminStoresPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editStore, setEditStore] = useState<Store | undefined>()

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storesApi.delete(id, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); toast.success("O'chirildi") },
    onError: () => toast.error('Xatolik'),
  })

  const filtered = stores.filter(s =>
    `${s.store_name} ${s.company_name} ${s.address || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Magazinlar">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Magazin qidirish..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Qo'shish</Button>
        </div>

        <Table headers={['Magazin', 'Firma', 'Telefon', 'Sotuvchi', 'Manzil', 'Sana', 'Amallar']}>
          {isLoading ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? <EmptyState /> : (
            filtered.map(store => (
              <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <StoreIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{store.store_name}</span>
                  </div>
                </Td>
                <Td>{store.company_name}</Td>
                <Td>{store.phone || '—'}</Td>
                <Td>
                  {store.seller ? (
                    <Link to={`/admin/sellers/${store.seller.id}`} className="text-blue-600 hover:underline text-sm">
                      {store.seller.first_name} {store.seller.last_name}
                    </Link>
                  ) : '—'}
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {store.latitude && <MapPin className="w-3 h-3 text-green-500" />}
                    <span className="text-xs truncate max-w-32">{store.address || '—'}</span>
                  </div>
                </Td>
                <Td>{formatDate(store.created_at, 'dd.MM.yyyy')}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditStore(store)}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Tahrirlash">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => { if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(store.id) }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="O'chirish">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </Table>
      </div>

      <StoreModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      {editStore && <StoreModal isOpen={!!editStore} onClose={() => setEditStore(undefined)} store={editStore} />}
    </Layout>
  )
}