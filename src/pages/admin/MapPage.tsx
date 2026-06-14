import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { VisitsMap } from '@/components/map/VisitsMap'
import { Select } from '@/components/ui/Input'
import { visitsApi } from '@/api/visits'
import { sellersApi } from '@/api/sellers'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import type { FilterParams, VisitStatus } from '@/types'

export function AdminMapPage() {
  const [filters, setFilters] = useState<FilterParams>({})

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitsApi.getAll(filters),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  return (
    <Layout title="Xarita">
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <Select
            value={filters.sellerId || ''}
            onChange={(e) => setFilters({ ...filters, sellerId: e.target.value || undefined })}
            className="w-48"
          >
            <option value="">Barcha sotuvchilar</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </Select>
          <Select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as VisitStatus) || undefined })}
            className="w-48"
          >
            <option value="">Barcha holatlar</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <div>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VISIT_STATUS_COLORS[key as VisitStatus] }} />
              {label}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
          <VisitsMap visits={visits} height="calc(100vh - 280px)" />
        </div>

        <p className="text-sm text-slate-500">
          {visits.filter((v) => v.latitude).length} ta tashrif xaritada ko'rsatildi
        </p>
      </div>
    </Layout>
  )
}
