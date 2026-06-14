import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, MapPin, User, Building } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { storesApi } from '@/api/stores'
import { visitsApi } from '@/api/visits'
import { formatDate } from '@/lib/utils'
import type { VisitStatus } from '@/types'

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: store } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.getById(id!),
    enabled: !!id,
  })

  const { data: visits = [] } = useQuery({
    queryKey: ['visits-by-store', id],
    queryFn: () => visitsApi.getAll(),
    enabled: !!id,
    select: (data) => data.filter((v) => v.store_id === id),
  })

  if (!store) return <Layout title="Magazin"><div className="flex items-center justify-center h-64 text-slate-400">Yuklanmoqda...</div></Layout>

  return (
    <Layout title={store.store_name}>
      <div className="space-y-6">
        <Link to="/admin/stores" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Magazin Ma'lumotlari</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium">{store.store_name}</p>
                  <p className="text-slate-500">{store.company_name}</p>
                </div>
              </div>
              {store.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{store.phone}</span>
                </div>
              )}
              {store.contact_person && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{store.contact_person}</span>
                </div>
              )}
              {store.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{store.address}</span>
                </div>
              )}
              {store.latitude && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <a
                    href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Xaritada ko'rish
                  </a>
                </div>
              )}
              {store.seller && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Sotuvchi</p>
                  <Link to={`/admin/sellers/${store.seller.id}`} className="text-blue-600 hover:underline font-medium">
                    {store.seller.first_name} {store.seller.last_name}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{visits.length}</p>
              <p className="text-sm text-slate-500 mt-1">Jami Tashriflar</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{visits.filter((v) => v.status === 'bought').length}</p>
              <p className="text-sm text-slate-500 mt-1">Sotilgan</p>
            </Card>
          </div>
        </div>

        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Tashrif Tarixi</h3>
          </div>
          <Table headers={['Sotuvchi', 'Holat', 'Izoh', 'Vaqt']}>
            {visits.length === 0 ? <EmptyState /> : visits.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Td><span className="font-medium">{v.seller?.first_name} {v.seller?.last_name}</span></Td>
                <Td><VisitStatusBadge status={v.status as VisitStatus} /></Td>
                <Td><p className="text-xs text-slate-500 truncate max-w-xs">{v.notes || '—'}</p></Td>
                <Td>{formatDate(v.visited_at)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </Layout>
  )
}
