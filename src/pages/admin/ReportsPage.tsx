import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { visitsApi } from '@/api/visits'
import { installationsApi } from '@/api/installations'
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
    daily: { startDate: format(subDays(now, 30), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') },
    weekly: { startDate: format(startOfWeek(now), 'yyyy-MM-dd'), endDate: format(endOfWeek(now), 'yyyy-MM-dd') },
    monthly: { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') },
  }

  const filters: FilterParams = { ...dateRanges[period], sellerId: sellerId || undefined }

  const { data: visits = [] } = useQuery({
    queryKey: ['visits-reports', filters],
    queryFn: () => visitsApi.getAll(filters),
  })

  const { data: installations = [] } = useQuery({
    queryKey: ['installations-reports'],
    queryFn: () => installationsApi.getAll(),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  const agents = sellers.filter(s => s.role === 'seller')
  const installers = sellers.filter(s => s.role === 'sotrudnik')

  // Status distribution
  const statusData = Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: visits.filter(v => v.status === key).length,
    color: VISIT_STATUS_COLORS[key as VisitStatus],
  })).filter(d => d.value > 0)

  // Daily visits for last 30 days
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    return {
      date: format(date, 'dd.MM'),
      count: visits.filter(v => v.visited_at.startsWith(dateStr)).length,
    }
  })

  // Seller (agent) performance
  const sellerData = agents.map(s => ({
    name: `${s.first_name} ${s.last_name}`,
    tashriflar: visits.filter(v => v.seller_id === s.id).length,
    sotilgan: visits.filter(v => v.seller_id === s.id && v.status === 'bought').length,
  })).sort((a, b) => b.tashriflar - a.tashriflar).slice(0, 10)

  // Installer (sotrudnik) performance with money
  const installerData = installers.map(s => {
    const myInst = installations.filter(i => i.sotrudnik_id === s.id)
    return {
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      jami: myInst.length,
      ornatilgan: myInst.filter(i => i.status === 'installed').length,
      yigilganPul: myInst.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
      qarz: myInst.reduce((sum, i) => sum + (i.debt_amount || 0), 0),
    }
  }).sort((a, b) => b.ornatilgan - a.ornatilgan)

  const totalCollected = installations.reduce((sum, i) => sum + (i.amount_paid || 0), 0)
  const totalDebt = installations.reduce((sum, i) => sum + (i.debt_amount || 0), 0)
  const totalInstalled = installations.filter(i => i.status === 'installed').length

  return (
    <Layout title="Hisobotlar">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
                {p === 'daily' ? 'Kunlik' : p === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
          <Select value={sellerId} onChange={e => setSellerId(e.target.value)} className="w-48">
            <option value="">Barcha sotuvchilar</option>
            {agents.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </Select>
        </div>

        {/* Sales Summary */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-2">📋 Savdo statistikasi (sotuvchilar)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{visits.length}</p>
              <p className="text-sm text-slate-500 mt-1">Jami Tashriflar</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{visits.filter(v => v.status === 'bought').length}</p>
              <p className="text-sm text-slate-500 mt-1">Sotilgan</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-red-600">{visits.filter(v => v.status === 'not_bought').length}</p>
              <p className="text-sm text-slate-500 mt-1">Sotilmagan</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {visits.length > 0 ? Math.round((visits.filter(v => v.status === 'bought').length / visits.length) * 100) : 0}%
              </p>
              <p className="text-sm text-slate-500 mt-1">Konversiya</p>
            </Card>
          </div>
        </div>

        {/* Installation & Money Summary */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 mb-2">🔧 O'rnatish va to'lov statistikasi (sotrudniklar)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">{installations.length}</p>
              <p className="text-sm text-slate-500 mt-1">Jami O'rnatishlar</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{totalInstalled}</p>
              <p className="text-sm text-slate-500 mt-1">Muvaffaqiyatli</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalCollected.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Jami yig'ilgan (so'm)</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-red-600">{totalDebt.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Jami qarz (so'm)</p>
            </Card>
          </div>
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
                  <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-slate-400">Ma'lumot yo'q</div>
            )}
          </Card>
        </div>

        <Card>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Sotuvchilar natijasi (kim qancha sotdi)</h3>
          {sellerData.length > 0 ? (
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
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">Sotuvchi yo'q</div>
          )}
        </Card>

        {/* Sotrudnik / Installer performance table */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Sotrudniklar natijasi (kim qancha o'rnatdi)</h3>
          </div>
          {installerData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Sotrudnik yo'q</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Sotrudnik</th>
                    <th className="px-4 py-3 font-medium">Jami</th>
                    <th className="px-4 py-3 font-medium">O'rnatilgan</th>
                    <th className="px-4 py-3 font-medium">Yig'ilgan pul</th>
                    <th className="px-4 py-3 font-medium">Qarz</th>
                  </tr>
                </thead>
                <tbody>
                  {installerData.map(d => (
                    <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{d.name}</td>
                      <td className="px-4 py-3">{d.jami}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{d.ornatilgan}</td>
                      <td className="px-4 py-3 text-blue-600">{d.yigilganPul.toLocaleString()} so'm</td>
                      <td className="px-4 py-3 text-red-500">{d.qarz.toLocaleString()} so'm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}