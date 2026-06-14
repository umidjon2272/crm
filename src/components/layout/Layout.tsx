import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Header title={title} sidebarCollapsed={collapsed} />
      <main className={cn(
        'transition-all duration-300 pt-16',
        collapsed ? 'ml-16' : 'ml-64'
      )}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
