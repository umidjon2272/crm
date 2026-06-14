import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Store, MapPin, BarChart3, FileText,
  Map, Settings, LogOut, ChevronLeft, ChevronRight, ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import { Avatar } from '@/components/ui/Avatar'
import toast from 'react-hot-toast'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (!user) return
    try {
      await authApi.logout(user.id)
      navigate('/login')
    } catch {
      toast.error('Chiqishda xatolik')
    }
  }

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/sellers', label: 'Sotuvchilar', icon: Users },
    { to: '/admin/stores', label: 'Magazinlar', icon: Store },
    { to: '/admin/visits', label: 'Tashriflar', icon: MapPin },
    { to: '/admin/map', label: 'Xarita', icon: Map },
    { to: '/admin/reports', label: 'Hisobotlar', icon: BarChart3 },
    { to: '/admin/logs', label: 'Loglar', icon: FileText },
    { to: '/admin/settings', label: 'Sozlamalar', icon: Settings },
  ]

  const sellerLinks = [
    { to: '/seller', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/seller/stores', label: 'Magazinlar', icon: Store },
    { to: '/seller/visits', label: 'Tashriflar', icon: MapPin },
    { to: '/seller/map', label: 'Xarita', icon: Map },
    { to: '/seller/profile', label: 'Profil', icon: Settings },
  ]

  const links = profile?.role === 'admin' ? adminLinks : sellerLinks

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-slate-900 dark:bg-slate-950 flex flex-col z-40 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-slate-800', !collapsed && 'gap-3')}>
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">CRM Savdo</p>
            <p className="text-slate-400 text-xs">Tizimi</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800',
              collapsed && 'justify-center'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        {profile && (
          <div className={cn('flex items-center gap-3 px-2 py-2 rounded-lg', !collapsed && 'mb-2')}>
            <Avatar
              firstName={profile.first_name}
              lastName={profile.last_name}
              avatarUrl={profile.avatar_url}
              size="sm"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-slate-400 text-xs capitalize">{profile.role === 'admin' ? 'Admin' : 'Sotuvchi'}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Chiqish' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Chiqish'}
        </button>
      </div>
    </aside>
  )
}
