import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit, Shield } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import { customRolesApi } from '@/api/customRoles'
import type { CustomRole } from '@/types'
import toast from 'react-hot-toast'

const PERMISSION_LABELS: Record<string, string> = {
  can_add_stores: 'Magazin qo\'shish',
  can_edit_stores: 'Magazin tahrirlash/o\'chirish',
  can_add_visits: 'Tashrif qo\'shish',
  can_view_reports: 'Hisobotlarni ko\'rish',
  can_add_users: 'Foydalanuvchi qo\'shish',
}

const initialRoleForm = {
  name: '',
  can_add_stores: false,
  can_edit_stores: false,
  can_add_visits: false,
  can_view_reports: false,
  can_add_users: false,
}

function RoleModal({ isOpen, onClose, role }: { isOpen: boolean; onClose: () => void; role?: CustomRole }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(role ? {
    name: role.name,
    can_add_stores: role.can_add_stores,
    can_edit_stores: role.can_edit_stores,
    can_add_visits: role.can_add_visits,
    can_view_reports: role.can_view_reports,
    can_add_users: role.can_add_users,
  } : initialRoleForm)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Rol nomini kiriting'); return }
    setLoading(true)
    try {
      if (role) {
        await customRolesApi.update(role.id, form)
        toast.success('Rol yangilandi')
      } else {
        await customRolesApi.create(form)
        toast.success('Rol yaratildi')
      }
      qc.invalidateQueries({ queryKey: ['custom-roles'] })
      onClose()
    } catch {
      toast.error('Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Rolni tahrirlash' : 'Yangi Rol Yaratish'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Rol nomi *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Masalan: Menejer" required />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Huquqlar</label>
          <div className="space-y-2">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.checked })}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
              </label>
            ))}
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

function CustomRolesSection() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editRole, setEditRole] = useState<CustomRole | undefined>()

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: customRolesApi.getAll,
  })

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    try {
      await customRolesApi.delete(id)
      qc.invalidateQueries({ queryKey: ['custom-roles'] })
      toast.success("O'chirildi")
    } catch {
      toast.error('Xatolik')
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Maxsus Rollar</h3>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Yangi rol
        </Button>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Foydalanuvchilarga o'ziga xos nomlar va aniq huquqlar bilan maxsus rol yaratishingiz mumkin (masalan: "Menejer" — faqat magazin qo'shish huquqi bilan).
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      ) : roles.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">Hali maxsus rol yaratilmagan</div>
      ) : (
        <div className="space-y-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{role.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(PERMISSION_LABELS).filter(([key]) => (role as any)[key]).map(([key, label]) => (
                    <span key={key} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full">
                      {label}
                    </span>
                  ))}
                  {Object.entries(PERMISSION_LABELS).every(([key]) => !(role as any)[key]) && (
                    <span className="text-xs text-slate-400">Hech qanday huquq yo'q</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditRole(role)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Tahrirlash">
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button onClick={() => handleDelete(role.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="O'chirish">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoleModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      {editRole && <RoleModal isOpen={!!editRole} onClose={() => setEditRole(undefined)} role={editRole} />}
    </Card>
  )
}

export function AdminSettingsPage() {
  const { profile, refetchProfile } = useAuth()
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => authApi.updateProfile(profile!.id, data),
    onSuccess: () => {
      toast.success('Profil yangilandi')
      refetchProfile()
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  if (!profile) return null

  return (
    <Layout title="Sozlamalar">
      <div className="max-w-2xl space-y-6">
        <Card>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Profil Ma'lumotlari</h3>
          <div className="flex items-center gap-4 mb-6">
            <Avatar firstName={profile.first_name} lastName={profile.last_name} avatarUrl={profile.avatar_url} size="xl" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{profile.first_name} {profile.last_name}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <p className="text-xs text-blue-600 mt-1 capitalize">{profile.role === 'admin' ? 'Administrator' : 'Sotuvchi'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ism" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <Input label="Familiya" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <Input label="Telefon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
            <Input label="Email" value={profile.email} disabled />
          </div>

          <Button className="mt-6" isLoading={updateMutation.isPending} onClick={() => updateMutation.mutate(form)}>
            Saqlash
          </Button>
        </Card>

        <CustomRolesSection />
      </div>
    </Layout>
  )
}