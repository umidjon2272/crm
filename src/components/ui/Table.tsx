import React from 'react'
import { cn } from '@/lib/utils'

interface TableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export function Table({ headers, children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700', className)}>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-slate-700 dark:text-slate-300', className)}>
      {children}
    </td>
  )
}

export function EmptyState({ message = 'Ma\'lumot topilmadi' }: { message?: string }) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
        {message}
      </td>
    </tr>
  )
}
