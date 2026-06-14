import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { VisitsMap } from '@/components/map/VisitsMap'
import { visitsApi } from '@/api/visits'
import { useAuth } from '@/context/AuthContext'

export function SellerMapPage() {
  const { user } = useAuth()
  const { data: visits = [] } = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: () => visitsApi.getMine(user!.id),
    enabled: !!user,
  })

  return (
    <Layout title="Xarita">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {visits.filter((v) => v.latitude).length} ta tashrif joylashuvi ko'rsatilmoqda
        </p>
        <VisitsMap visits={visits} height="calc(100vh - 200px)" />
      </div>
    </Layout>
  )
}
