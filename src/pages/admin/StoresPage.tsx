import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Store as StoreIcon, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { storesApi } from '@/api/stores'
import { formatDate } from '@/lib/utils'

export function AdminStoresPage() {
  const [search, setSearch] = useState('')

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
  })

  const filtered = stores.filter((s) =>
    `${s.store_name} ${s.company_name} ${s.address || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Magazinlar">
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Magazin qidirish..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Table headers={['Magazin', 'Firma', 'Telefon', 'Mas\'ul Shaxs', 'Sotuvchi', 'Manzil', 'Sana']}>
          {isLoading ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((store) => (
              <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <StoreIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <Link to={`/admin/stores/${store.id}`} className="font-medium text-blue-600 hover:underline">
                      {store.store_name}
                    </Link>
                  </div>
                </Td>
                <Td>{store.company_name}</Td>
                <Td>{store.phone || '—'}</Td>
                <Td>{store.contact_person || '—'}</Td>
                <Td>
                  {store.seller ? (
                    <Link to={`/admin/sellers/${store.seller.id}`} className="text-blue-600 hover:underline text-sm">
                      {store.seller.first_name} {store.seller.last_name}
                    </Link>
                  ) : '—'}
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {store.latitude && <MapPin className="w-3 h-3 text-green-500" />}
                    <span className="text-xs">{store.address || '—'}</span>
                  </div>
                </Td>
                <Td>{formatDate(store.created_at, 'dd.MM.yyyy')}</Td>
              </tr>
            ))
          )}
        </Table>
      </div>
    </Layout>
  )
}
