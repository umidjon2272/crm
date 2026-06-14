import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserX, Store, MapPin, TrendingUp, Calendar, BarChart2 } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { StatCard } from '@/components/ui/Card'
import { Card } from '@/components/ui/Card'
import { visitsApi } from '@/api/visits'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: visitsApi.getDashboardStats,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  const statusData = stats ? Object.entries(stats.visits_by_status || {}).map(([key, val]) => ({
    name: VISIT_STATUS_LABELS[key as keyof typeof VISIT_STATUS_LABELS] || key,
    value: val as number,
    color: VISIT_STATUS_COLORS[key as keyof typeof VISIT_STATUS_COLORS] || '#3b82f6',
  })) : []

  const barData = [
    { name: 'Bugun', tashriflar: stats?.today_visits || 0 },
    { name: 'Hafta', tashriflar: stats?.weekly_visits || 0 },
    { name: 'Oy', tashriflar: stats?.monthly_visits || 0 },
  ]

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Jami Sotuvchilar"
            value={stats?.total_sellers || 0}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Aktiv Sotuvchilar"
            value={stats?.active_sellers || 0}
            icon={<UserCheck className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Bloklangan"
            value={stats?.blocked_sellers || 0}
            icon={<UserX className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="Jami Magazinlar"
            value={stats?.total_stores || 0}
            icon={<Store className="w-6 h-6" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            title="Bugungi Tashriflar"
            value={stats?.today_visits || 0}
            icon={<MapPin className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Haftalik Tashriflar"
            value={stats?.weekly_visits || 0}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Oylik Tashriflar"
            value={stats?.monthly_visits || 0}
            icon={<BarChart2 className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Tashrif Statistikasi</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="tashriflar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Holat bo'yicha</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-slate-400">
                Ma'lumot mavjud emas
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  )
}
