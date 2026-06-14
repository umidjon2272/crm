import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function SellerProfilePage() {
  const { profile, refetchProfile } = useAuth()
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => authApi.updateProfile(profile!.id, data),
    onSuccess: () => { toast.success('Profil yangilandi'); refetchProfile() },
    onError: () => toast.error('Xatolik'),
  })

  if (!profile) return null

  return (
    <Layout title="Profilim">
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex flex-col items-center text-center py-4">
            <Avatar firstName={profile.first_name} lastName={profile.last_name} avatarUrl={profile.avatar_url} size="xl" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">{profile.first_name} {profile.last_name}</h2>
            <p className="text-slate-500 text-sm">{profile.email}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="blue">Sotuvchi</Badge>
              <Badge variant={profile.status === 'active' ? 'green' : 'red'}>
                {profile.status === 'active' ? 'Aktiv' : 'Bloklangan'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Qo'shilgan: {formatDate(profile.created_at, 'dd.MM.yyyy')}
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Ma'lumotlarni tahrirlash</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ism" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <Input label="Familiya" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <Input label="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
            <Input label="Email" value={profile.email} disabled />
            <Button isLoading={mutation.isPending} onClick={() => mutation.mutate(form)}>Saqlash</Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
