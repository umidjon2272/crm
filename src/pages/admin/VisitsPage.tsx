import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { VisitStatusBadge } from '@/components/ui/VisitStatusBadge'
import { Select } from '@/components/ui/Input'
import { visitsApi } from '@/api/visits'
import { sellersApi } from '@/api/sellers'
import { formatDate } from '@/lib/utils'
import { VISIT_STATUS_LABELS } from '@/types'
import type { VisitStatus, FilterParams } from '@/types'

export function AdminVisitsPage() {
  const [filters, setFilters] = useState<FilterParams>({})

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitsApi.getAll(filters),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  return (
    <Layout title="Tashriflar">
      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Boshlanish sanasi</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tugash sanasi</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            label="Sotuvchi"
            value={filters.sellerId || ''}
            onChange={(e) => setFilters({ ...filters, sellerId: e.target.value || undefined })}
          >
            <option value="">Barcha sotuvchilar</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </Select>
          <Select
            label="Holat"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as VisitStatus) || undefined })}
          >
            <option value="">Barcha holatlar</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{visits.length} ta tashrif topildi</p>
          <button
            onClick={() => setFilters({})}
            className="text-sm text-blue-600 hover:underline"
          >
            Filterni tozalash
          </button>
        </div>

        <Table headers={['Magazin', 'Sotuvchi', 'Holat', 'Izoh', 'Joylashuv', 'Vaqt']}>
          {isLoading ? (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : visits.length === 0 ? (
            <EmptyState />
          ) : (
            visits.map((visit) => (
              <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{visit.store?.store_name}</p>
                    <p className="text-xs text-slate-400">{visit.store?.company_name}</p>
                  </div>
                </Td>
                <Td>
                  <p className="font-medium">{visit.seller?.first_name} {visit.seller?.last_name}</p>
                </Td>
                <Td><VisitStatusBadge status={visit.status as VisitStatus} /></Td>
                <Td className="max-w-xs">
                  <p className="truncate text-slate-500 text-xs">{visit.notes || '—'}</p>
                </Td>
                <Td>
                  {visit.latitude ? (
                    <a
                      href={`https://maps.google.com/?q=${visit.latitude},${visit.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      📍 Ko'rish
                    </a>
                  ) : '—'}
                </Td>
                <Td className="whitespace-nowrap">{formatDate(visit.visited_at)}</Td>
              </tr>
            ))
          )}
        </Table>
      </div>
    </Layout>
  )
}
