import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, UserCheck, UserX, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { sellersApi } from '@/api/sellers'
import { customRolesApi } from '@/api/customRoles'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  let normalized = cleaned
  if (cleaned.startsWith('998')) normalized = cleaned
  else if (cleaned.startsWith('0')) normalized = '998' + cleaned.slice(1)
  else normalized = '998' + cleaned
  return `${normalized}@crm.uz`
}

function AddSellerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', phone: '', role: 'seller', custom_role_id: ''
  })
  const [loading, setLoading] = useState(false)

  const { data: customRoles = [] } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: customRolesApi.getAll,
  })

  const handlePhoneChange = (val: string) => {
    const email = val.trim() ? phoneToEmail(val) : ''
    setForm({ ...form, phone: val, email })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone) { toast.error("Telefon raqam kiritilishi shart"); return }
    setLoading(true)
    try {
      await sellersApi.create({ ...form, custom_role_id: form.custom_role_id || null })
      toast.success(form.role === 'sotrudnik' ? 'Sotrudnik qo\'shildi' : 'Sotuvchi qo\'shildi')
      qc.invalidateQueries({ queryKey: ['sellers'] })
      onClose()
      setForm({ email: '', password: '', first_name: '', last_name: '', phone: '', role: 'seller', custom_role_id: '' })
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi Foydalanuvchi Qo'shish">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ism *" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
          <Input label="Familiya" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon raqam *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="901234567"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
          />
          <p className="text-xs text-slate-400 mt-1">Misol: 901234567 yoki +998901234567</p>
        </div>

        <Input label="Parol *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol *</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="seller">Sotuvchi (Agent)</option>
            <option value="sotrudnik">Sotrudnik (O'rnatuvchi)</option>
          </select>
        </div>

        {customRoles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maxsus rol (ixtiyoriy)</label>
            <select value={form.custom_role_id} onChange={e => setForm({ ...form, custom_role_id: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
              <option value="">Yo'q (standart rol)</option>
              {customRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">Maxsus rol tanlansa, foydalanuvchi faqat shu rolga belgilangan huquqlarga ega bo'ladi</p>
          </div>
        )}

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

  const { data: customRoles = [] } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: customRolesApi.getAll,
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success("O'chirildi") },
    onError: () => toast.error('Xatolik'),
  })

  const filtered = sellers.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email} ${s.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleName = (seller: any) => {
    if (seller.custom_role_id) {
      const cr = customRoles.find(r => r.id === seller.custom_role_id)
      if (cr) return cr.name
    }
    return seller.role === 'sotrudnik' ? 'Sotrudnik' : 'Sotuvchi'
  }

  return (
    <Layout title="Xodimlar">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Qo'shish</Button>
        </div>

        <Table headers={['Xodim', 'Telefon', 'Rol', 'Holat', 'Qo\'shilgan', 'Amallar']}>
          {isLoading ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map(seller => (
              <tr key={seller.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar firstName={seller.first_name} lastName={seller.last_name} avatarUrl={seller.avatar_url} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{seller.first_name} {seller.last_name}</p>
                      <p className="text-xs text-slate-400">{seller.email?.replace('@crm.uz', '')}</p>
                    </div>
                  </div>
                </Td>
                <Td>{seller.phone || seller.email?.replace('@crm.uz', '').replace('998', '+998 ') || '—'}</Td>
                <Td>
                  <Badge variant={(seller as any).custom_role_id ? 'orange' : seller.role === 'sotrudnik' ? 'purple' : 'blue'}>
                    {getRoleName(seller)}
                  </Badge>
                </Td>
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
                      <button onClick={() => { if (confirm('Bloklashni tasdiqlaysizmi?')) blockMutation.mutate(seller.id) }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Bloklash">
                        <UserX className="w-4 h-4 text-red-500" />
                      </button>
                    ) : (
                      <button onClick={() => activateMutation.mutate(seller.id)}
                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Aktivlashtirish">
                        <UserCheck className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button onClick={() => { if (confirm("O'chirishni tasdiqlaysizmi?")) deleteMutation.mutate(seller.id) }}
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
      <AddSellerModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}