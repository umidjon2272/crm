import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { sellersApi } from '@/api/sellers'
import { visitsApi } from '@/api/visits'
import { storesApi } from '@/api/stores'
import { formatDate } from '@/lib/utils'
import type { VisitStatus } from '@/types'

export function SellerDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: seller } = useQuery({
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

  if (!seller) return (
    <Layout title="Sotuvchi">
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
              <Badge variant={seller.status === 'active' ? 'green' : 'red'} size="md" className="mt-2">
                {seller.status === 'active' ? 'Aktiv' : 'Bloklangan'}
              </Badge>
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{seller.email}</span>
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
                {visits.filter((v) => v.status === 'bought').length}
              </p>
              <p className="text-sm text-slate-500 mt-1">Sotilgan</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {visits.filter((v) => {
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
            {visits.slice(0, 10).length === 0 ? <EmptyState /> : visits.slice(0, 10).map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Td>
                  <div>
                    <p className="font-medium">{v.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{v.store?.company_name}</p>
                  </div>
                </Td>
                <Td><VisitStatusBadge status={v.status as VisitStatus} /></Td>
                <Td className="max-w-xs">
                  <p className="truncate text-slate-500">{v.notes || '—'}</p>
                </Td>
                <Td>{formatDate(v.visited_at)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </Layout>
  )
}
