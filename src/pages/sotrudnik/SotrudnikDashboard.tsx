import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { StatCard, Card } from '@/components/ui/Card'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { installationsApi } from '@/api/installations'
import { useAuth } from '@/context/AuthContext'
import { INSTALLATION_STATUS_LABELS, INSTALLATION_STATUS_COLORS } from '@/types'
import type { InstallationStatus } from '@/types'
import { formatDate } from '@/lib/utils'

export function SotrudnikDashboard() {
  const { user, profile } = useAuth()

  const { data: installations = [] } = useQuery({
    queryKey: ['my-installations', user?.id],
    queryFn: () => installationsApi.getMine(user!.id),
    enabled: !!user,
  })

  const today = new Date().toISOString().split('T')[0]
  const todayInst = installations.filter(i => i.installed_at.startsWith(today))
  const installed = installations.filter(i => i.status === 'installed')
  const recent = installations.slice(0, 5)

  return (
    <Layout title={`Xush kelibsiz, ${profile?.first_name}!`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Jami O'rnatishlar" value={installations.length} icon={<span className="text-2xl">🔧</span>} color="blue" />
          <StatCard title="O'rnatildi" value={installed.length} icon={<span className="text-2xl">✅</span>} color="green" />
          <StatCard title="Bugun" value={todayInst.length} icon={<span className="text-2xl">📅</span>} color="orange" />
          <StatCard title="Muammo" value={installations.filter(i => i.status === 'problem').length} icon={<span className="text-2xl">⚠️</span>} color="red" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(INSTALLATION_STATUS_LABELS).map(([k, v]) => (
            <Card key={k} className="text-center p-3">
              <p className="text-xl font-bold" style={{ color: INSTALLATION_STATUS_COLORS[k as InstallationStatus] }}>
                {installations.filter(i => i.status === k).length}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-tight">{v}</p>
            </Card>
          ))}
        </div>

        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">So'nggi O'rnatishlar</h3>
          </div>
          <Table headers={['Magazin', 'Holat', 'Izoh', 'Vaqt']}>
            {recent.length === 0 ? <EmptyState message="Hali o'rnatish yo'q" /> : (
              recent.map(inst => (
                <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Td>
                    <p className="font-medium">{inst.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{inst.store?.company_name}</p>
                  </Td>
                  <Td>
                    <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{ background: INSTALLATION_STATUS_COLORS[inst.status] + '20', color: INSTALLATION_STATUS_COLORS[inst.status] }}>
                      {INSTALLATION_STATUS_LABELS[inst.status]}
                    </span>
                  </Td>
                  <Td><p className="text-xs text-slate-500 truncate max-w-xs">{inst.notes || '—'}</p></Td>
                  <Td className="whitespace-nowrap text-xs">{formatDate(inst.installed_at)}</Td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>
    </Layout>
  )
}