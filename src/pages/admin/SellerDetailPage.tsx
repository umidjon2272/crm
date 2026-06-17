import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, Calendar, Eye, EyeOff, Edit, Key } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { sellersApi } from '@/api/sellers'
import { visitsApi } from '@/api/visits'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { VisitStatus } from '@/types'
import toast from 'react-hot-toast'

function EditSellerModal({ seller, isOpen, onClose }: { seller: any; isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    first_name: seller.first_name || '',
    last_name: seller.last_name || '',
    phone: seller.phone || '',
    role: seller.role || 'seller',
    status: seller.status || 'active',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sellersApi.update(seller.id, form, user!.id)
      toast.success('Profil yangilandi')
      qc.invalidateQueries({ queryKey: ['seller', seller.id] })
      qc.invalidateQueries({ queryKey: ['sellers'] })
      onClose()
    } catch {
      toast.error('Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profilni tahrirlash">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ism" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
          <Input label="Familiya" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
        </div>
        <Input label="Telefon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="seller">Sotuvchi</option>
            <option value="sotrudnik">Sotrudnik</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Holat</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
            <option value="active">Aktiv</option>
            <option value="blocked">Bloklangan</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">Saqlash</Button>
        </div>
      </form>
    </Modal>
  )
}

function ChangePasswordModal({ seller, isOpen, onClose }: { seller: any; isOpen: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('Parol kamida 6 ta belgi'); return }
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const { data, error } = await supabase.functions.invoke('update-password', {
        body: { userId: seller.id, newPassword },
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast.success('Parol yangilandi')
      onClose()
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parolni o'zgartirish">
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>{seller.first_name} {seller.last_name}</strong> ({seller.email})
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Yangi parol"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">O'zgartirish</Button>
        </div>
      </form>
    </Modal>
  )
}

export function SellerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [showEdit, setShowEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller', id],
    queryFn: () => sellersApi.getById(id!),
    enabled: !!id,
  })

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', { sellerId: id }],
    queryFn: () => visitsApi.getAll({ sellerId: id }),
    enabled: !!id,
  })

  const { data: stores = [] } = useQuery({
    queryKey: ['stores', { sellerId: id }],
    queryFn: () => storesApi.getAll({ sellerId: id }),
    enabled: !!id,
  })

  if (isLoading || !seller) return (
    <Layout title="Xodim">
      <div className="flex items-center justify-center h-64 text-slate-400">Yuklanmoqda...</div>
    </Layout>
  )

  return (
    <Layout title={`${seller.first_name} ${seller.last_name}`}>
      <div className="space-y-6">
        <Link to="/admin/sellers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar firstName={seller.first_name} lastName={seller.last_name} avatarUrl={seller.avatar_url} size="xl" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                {seller.first_name} {seller.last_name}
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge variant={seller.role === 'sotrudnik' ? 'purple' : 'blue'}>
                  {seller.role === 'sotrudnik' ? 'Sotrudnik' : 'Sotuvchi'}
                </Badge>
                <Badge variant={seller.status === 'active' ? 'green' : 'red'}>
                  {seller.status === 'active' ? 'Aktiv' : 'Bloklangan'}
                </Badge>
              </div>

              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300 break-all">{seller.email}</span>
                </div>
                {seller.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">{seller.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{formatDate(seller.created_at, 'dd.MM.yyyy')}</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={() => setShowEdit(true)}
                >
                  Profilni tahrirlash
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Key className="w-4 h-4" />}
                  onClick={() => setShowPassword(true)}
                >
                  Parolni o'zgartirish
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stores.length}</p>
              <p className="text-sm text-slate-500 mt-1">Jami Magazinlar</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{visits.length}</p>
              <p className="text-sm text-slate-500 mt-1">Jami Tashriflar</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {visits.filter(v => v.status === 'bought').length}
              </p>
              <p className="text-sm text-slate-500 mt-1">Sotilgan</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {visits.filter(v => {
                  const d = new Date(v.visited_at)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="text-sm text-slate-500 mt-1">Bu oy</p>
            </Card>
          </div>
        </div>

        {/* Recent Visits */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">So'nggi Tashriflar</h3>
          </div>
          <Table headers={['Magazin', 'Holat', 'Izoh', 'Vaqt']}>
            {visits.slice(0, 10).length === 0 ? <EmptyState /> : visits.slice(0, 10).map(v => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Td>
                  <div>
                    <p className="font-medium">{v.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{v.store?.company_name}</p>
                  </div>
                </Td>
                <Td><VisitStatusBadge status={v.status as VisitStatus} /></Td>
                <Td className="max-w-xs"><p className="truncate text-slate-500">{v.notes || '—'}</p></Td>
                <Td>{formatDate(v.visited_at)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {showEdit && <EditSellerModal seller={seller} isOpen={showEdit} onClose={() => setShowEdit(false)} />}
      {showPassword && <ChangePasswordModal seller={seller} isOpen={showPassword} onClose={() => setShowPassword(false)} />}
    </Layout>
  )
}