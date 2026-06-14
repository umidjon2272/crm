import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Table, Td, EmptyState } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Kirdi',
  LOGOUT: 'Chiqdi',
  CREATE_SELLER: 'Sotuvchi qo\'shdi',
  UPDATE_SELLER: 'Sotuvchi yangiladi',
  BLOCK_SELLER: 'Sotuvchi blokladi',
  ACTIVATE_SELLER: 'Sotuvchi aktivlashtirdi',
  DELETE_SELLER: 'Sotuvchi o\'chirdi',
  CREATE_STORE: 'Magazin qo\'shdi',
  UPDATE_STORE: 'Magazin yangiladi',
  DELETE_STORE: 'Magazin o\'chirdi',
  CREATE_VISIT: 'Tashrif qo\'shdi',
  UPDATE_PROFILE: 'Profil yangiladi',
}

const ACTION_COLORS: Record<string, 'green' | 'red' | 'blue' | 'yellow' | 'gray'> = {
  LOGIN: 'green',
  LOGOUT: 'gray',
  CREATE_SELLER: 'blue',
  BLOCK_SELLER: 'red',
  ACTIVATE_SELLER: 'green',
  DELETE_SELLER: 'red',
  CREATE_STORE: 'blue',
  CREATE_VISIT: 'green',
  UPDATE_PROFILE: 'yellow',
}

export function AdminLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*, user:profiles(first_name, last_name, email, role)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data || []
    },
  })

  return (
    <Layout title="Loglar">
      <Table headers={['Foydalanuvchi', 'Amal', 'Tafsilot', 'Vaqt']}>
        {isLoading ? (
          <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">Yuklanmoqda...</td></tr>
        ) : logs.length === 0 ? <EmptyState /> : (
          logs.map((log: any) => (
            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <Td>
                <div>
                  <p className="font-medium">{log.user?.first_name} {log.user?.last_name}</p>
                  <p className="text-xs text-slate-400">{log.user?.email}</p>
                </div>
              </Td>
              <Td>
                <Badge variant={ACTION_COLORS[log.action] || 'gray'}>
                  {ACTION_LABELS[log.action] || log.action}
                </Badge>
              </Td>
              <Td className="max-w-xs">
                <p className="text-xs text-slate-500 truncate font-mono">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </p>
              </Td>
              <Td className="whitespace-nowrap text-xs">{formatDate(log.created_at)}</Td>
            </tr>
          ))
        )}
      </Table>
    </Layout>
  )
}
