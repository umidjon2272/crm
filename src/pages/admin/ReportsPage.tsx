import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { visitsApi } from '@/api/visits'
import { sellersApi } from '@/api/sellers'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import type { FilterParams, VisitStatus } from '@/types'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, subDays } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

type Period = 'daily' | 'weekly' | 'monthly'

export function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [sellerId, setSellerId] = useState('')

  const now = new Date()
  const dateRanges: Record<Period, { startDate: string; endDate: string }> = {
    daily: {
      startDate: format(subDays(now, 30), 'yyyy-MM-dd'),
      endDate: format(now, 'yyyy-MM-dd'),
    },
    weekly: {
      startDate: format(startOfWeek(now), 'yyyy-MM-dd'),
      endDate: format(endOfWeek(now), 'yyyy-MM-dd'),
    },
    monthly: {
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    },
  }

  const filters: FilterParams = {
    ...dateRanges[period],
    sellerId: sellerId || undefined,
  }

  const { data: visits = [] } = useQuery({
    queryKey: ['visits-reports', filters],
    queryFn: () => visitsApi.getAll(filters),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  // Status distribution
  const statusData = Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: visits.filter((v) => v.status === key).length,
    color: VISIT_STATUS_COLORS[key as VisitStatus],
  })).filter((d) => d.value > 0)

  // Daily visits for last 30 days
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    return {
      date: format(date, 'dd.MM'),
      count: visits.filter((v) => v.visited_at.startsWith(dateStr)).length,
    }
  })

  // Seller performance
  const sellerData = sellers.map((s) => ({
    name: `${s.first_name} ${s.last_name}`,
    tashriflar: visits.filter((v) => v.seller_id === s.id).length,
    sotilgan: visits.filter((v) => v.seller_id === s.id && v.status === 'bought').length,
  })).sort((a, b) => b.tashriflar - a.tashriflar).slice(0, 10)

  return (
    <Layout title="Hisobotlar">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {p === 'daily' ? 'Kunlik' : p === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
          <Select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-48"
          >
            <option value="">Barcha sotuvchilar</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </Select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">{visits.length}</p>
            <p className="text-sm text-slate-500 mt-1">Jami Tashriflar</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">{visits.filter((v) => v.status === 'bought').length}</p>
            <p className="text-sm text-slate-500 mt-1">Sotilgan</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-red-600">{visits.filter((v) => v.status === 'not_bought').length}</p>
            <p className="text-sm text-slate-500 mt-1">Sotilmagan</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {visits.length > 0 ? Math.round((visits.filter((v) => v.status === 'bought').length / visits.length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-500 mt-1">Konversiya</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">So'nggi 30 kun tashriflari</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="Tashriflar" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Holat bo'yicha taqsimot</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-slate-400">Ma'lumot yo'q</div>
            )}
          </Card>
        </div>

        <Card>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Sotuvchilar natijasi</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sellerData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tashriflar" fill="#3b82f6" name="Tashriflar" radius={[0, 4, 4, 0]} />
              <Bar dataKey="sotilgan" fill="#22c55e" name="Sotilgan" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Layout>
  )
}
