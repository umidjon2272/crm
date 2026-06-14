import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

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
              <Input
                label="Ism"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <Input
                label="Familiya"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+998901234567"
            />
            <Input label="Email" value={profile.email} disabled />
          </div>

          <Button
            className="mt-6"
            isLoading={updateMutation.isPending}
            onClick={() => updateMutation.mutate(form)}
          >
            Saqlash
          </Button>
        </Card>
      </div>
    </Layout>
  )
}
