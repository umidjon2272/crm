import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Store, MapPin, TrendingUp, Calendar } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { StatCard } from '@/components/ui/Card'
import { Card } from '@/components/ui/Card'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { visitsApi } from '@/api/visits'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import type { VisitStatus } from '@/types'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export function SellerDashboardPage() {
  const { user, profile } = useAuth()

  const { data: visits = [] } = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: () => visitsApi.getMine(user!.id),
    enabled: !!user,
  })

  const { data: stores = [] } = useQuery({
    queryKey: ['my-stores', user?.id],
    queryFn: () => storesApi.getMine(user!.id),
    enabled: !!user,
  })

  const now = new Date()
  const todayVisits = visits.filter((v) => {
    const d = new Date(v.visited_at)
    return d >= startOfDay(now) && d <= endOfDay(now)
  })
  const monthVisits = visits.filter((v) => {
    const d = new Date(v.visited_at)
    return d >= startOfMonth(now) && d <= endOfMonth(now)
  })

  const recentVisits = visits.slice(0, 5)

  return (
    <Layout title={`Xush kelibsiz, ${profile?.first_name}!`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Jami Magazinlar" value={stores.length} icon={<Store className="w-6 h-6" />} color="blue" />
          <StatCard title="Jami Tashriflar" value={visits.length} icon={<MapPin className="w-6 h-6" />} color="purple" />
          <StatCard title="Bugungi Tashriflar" value={todayVisits.length} icon={<Calendar className="w-6 h-6" />} color="orange" />
          <StatCard title="Bu oy Tashriflar" value={monthVisits.length} icon={<TrendingUp className="w-6 h-6" />} color="green" />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => {
            const count = visits.filter((v) => v.status === key).length
            return (
              <Card key={key} className="text-center p-3">
                <p className="text-xl font-bold" style={{ color: VISIT_STATUS_COLORS[key as VisitStatus] }}>{count}</p>
                <p className="text-xs text-slate-500 mt-1 leading-tight">{label}</p>
              </Card>
            )
          })}
        </div>

        {/* Recent Visits */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">So'nggi Tashriflar</h3>
          </div>
          <Table headers={['Magazin', 'Holat', 'Izoh', 'Vaqt']}>
            {recentVisits.length === 0 ? <EmptyState message="Hali tashrif yo'q" /> : (
              recentVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Td>
                    <div>
                      <p className="font-medium">{v.store?.store_name}</p>
                      <p className="text-xs text-slate-400">{v.store?.company_name}</p>
                    </div>
                  </Td>
                  <Td><VisitStatusBadge status={v.status as VisitStatus} /></Td>
                  <Td><p className="text-xs text-slate-500 truncate max-w-xs">{v.notes || '—'}</p></Td>
                  <Td>{formatDate(v.visited_at)}</Td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>
    </Layout>
  )
}
