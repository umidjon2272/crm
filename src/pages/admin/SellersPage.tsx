import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreVertical, UserCheck, UserX, Trash2, Edit, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { sellersApi } from '@/api/sellers'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function AddSellerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'seller' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sellersApi.create(form)
      toast.success('Sotuvchi muvaffaqiyatli qo\'shildi')
      qc.invalidateQueries({ queryKey: ['sellers'] })
      onClose()
      setForm({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'seller' })
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi Sotuvchi Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ism" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          <Input label="Familiya" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Parol" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        <Input label="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor qilish</Button>
          <Button type="submit" isLoading={loading} className="flex-1">Qo'shish</Button>
        </div>
      </form>
    </Modal>
  )
}

export function AdminSellersPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => sellersApi.block(id, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('Bloklandi') },
    onError: () => toast.error('Xatolik'),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => sellersApi.activate(id, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('Aktivlashtirildi') },
    onError: () => toast.error('Xatolik'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sellersApi.delete(id, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('O\'chirildi') },
    onError: () => toast.error('Xatolik'),
  })

  const filtered = sellers.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Sotuvchilar">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sotuvchi qidirish..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
            Qo'shish
          </Button>
        </div>

        <Table headers={['Sotuvchi', 'Email', 'Telefon', 'Holat', 'Qo\'shilgan', 'Amallar']}>
          {isLoading ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((seller) => (
              <tr key={seller.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar firstName={seller.first_name} lastName={seller.last_name} avatarUrl={seller.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{seller.first_name} {seller.last_name}</p>
                    </div>
                  </div>
                </Td>
                <Td>{seller.email}</Td>
                <Td>{seller.phone || '—'}</Td>
                <Td>
                  <Badge variant={seller.status === 'active' ? 'green' : 'red'}>
                    {seller.status === 'active' ? 'Aktiv' : 'Bloklangan'}
                  </Badge>
                </Td>
                <Td>{formatDate(seller.created_at, 'dd.MM.yyyy')}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <Link to={`/admin/sellers/${seller.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Ko'rish">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                    </Link>
                    {seller.status === 'active' ? (
                      <button
                        onClick={() => { if (confirm('Bloklashni tasdiqlaysizmi?')) blockMutation.mutate(seller.id) }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Bloklash"
                      >
                        <UserX className="w-4 h-4 text-red-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => activateMutation.mutate(seller.id)}
                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Aktivlashtirish"
                      >
                        <UserCheck className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('O\'chirishni tasdiqlaysizmi?')) deleteMutation.mutate(seller.id) }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </Table>
      </div>
      <AddSellerModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}
