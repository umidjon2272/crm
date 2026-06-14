import React from 'react'
import { Bell, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  title: string
  sidebarCollapsed: boolean
}

export function Header({ title, sidebarCollapsed }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800
      flex items-center px-6 gap-4 z-30 transition-all duration-300
      ${sidebarCollapsed ? 'left-16' : 'left-64'}
    `}>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
