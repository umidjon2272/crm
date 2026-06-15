import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/sellers', label: 'Sotuvchilar', icon: '👥' },
  { to: '/admin/stores', label: 'Magazinlar', icon: '🏪' },
  { to: '/admin/visits', label: 'Tashriflar', icon: '📍' },
  { to: '/admin/map', label: 'Xarita', icon: '🗺️' },
  { to: '/admin/reports', label: 'Hisobotlar', icon: '📈' },
  { to: '/admin/logs', label: 'Loglar', icon: '📋' },
  { to: '/admin/settings', label: 'Sozlamalar', icon: '⚙️' },
]

const sellerLinks = [
  { to: '/seller', label: 'Dashboard', icon: '📊', end: true },
  { to: '/seller/stores', label: 'Magazinlar', icon: '🏪' },
  { to: '/seller/visits', label: 'Tashriflar', icon: '📍' },
  { to: '/seller/map', label: 'Xarita', icon: '🗺️' },
  { to: '/seller/profile', label: 'Profil', icon: '👤' },
]

const sotrudnikLinks = [
  { to: '/sotrudnik', label: 'Dashboard', icon: '📊', end: true },
  { to: '/sotrudnik/installations', label: "O'rnatishlar", icon: '🔧' },
  { to: '/sotrudnik/profile', label: 'Profil', icon: '👤' },
]

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark(d => !d)
  }

  const handleLogout = async () => {
    try {
      await authApi.logout(user?.id || '')
    } catch {}
    navigate('/login')
    toast.success('Chiqildi')
  }

  const links = profile?.role === 'admin' ? adminLinks :
                profile?.role === 'sotrudnik' ? sotrudnikLinks :
                sellerLinks

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase()

  const roleLabel = profile?.role === 'admin' ? 'Admin' :
                    profile?.role === 'sotrudnik' ? 'Sotrudnik' : 'Sotuvchi'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">C</div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">CRM Savdo</p>
            <p className="text-slate-400 text-xs">Tizimi</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">✕</button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon, end }: any) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
              className={({ isActive }: any) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
              }>
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-slate-400 text-xs">{roleLabel}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
            <span>🚪</span> Chiqish
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            ☰
          </button>
          <h1 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white flex-1 truncate">{title}</h1>
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            {dark ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="flex-1 p-3 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-20">
        <div className="flex">
          {links.slice(0, 5).map(({ to, label, icon, end }: any) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }: any) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors
                ${isActive ? 'text-blue-600' : 'text-slate-400'}`
              }>
              <span className="text-xl">{icon}</span>
              <span className="mt-0.5 truncate w-full text-center px-1" style={{ fontSize: '10px' }}>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}