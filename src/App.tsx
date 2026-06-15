import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/context/AuthContext'

import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminSellersPage } from '@/pages/admin/SellersPage'
import { SellerDetailPage } from '@/pages/admin/SellerDetailPage'
import { AdminStoresPage } from '@/pages/admin/StoresPage'
import { AdminVisitsPage } from '@/pages/admin/VisitsPage'
import { AdminMapPage } from '@/pages/admin/MapPage'
import { AdminReportsPage } from '@/pages/admin/ReportsPage'
import { StoreDetailPage } from '@/pages/admin/StoreDetailPage'
import { AdminLogsPage } from '@/pages/admin/LogsPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { SellerDashboardPage } from '@/pages/seller/SellerDashboardPage'
import { SellerStoresPage } from '@/pages/seller/SellerStoresPage'
import { SellerVisitsPage } from '@/pages/seller/SellerVisitsPage'
import { SellerMapPage } from '@/pages/seller/SellerMapPage'
import { SellerProfilePage } from '@/pages/seller/SellerProfilePage'
import { SotrudnikDashboard } from '@/pages/sotrudnik/SotrudnikDashboard'
import { SotrudnikInstallations } from '@/pages/sotrudnik/SotrudnikInstallations'
import { SotrudnikProfile } from '@/pages/sotrudnik/SotrudnikProfile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
})

function ProtectedRoute({ children, role }: { 
  children: React.ReactNode
  role?: 'admin' | 'seller' | 'sotrudnik' 
}) {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) return <Navigate to="/login" replace />

  if (profile.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hisob Bloklangan</h2>
          <p className="text-slate-500 mt-2">Admin bilan bog'laning</p>
        </div>
      </div>
    )
  }

  if (role && profile.role !== role) {
    const redirect = profile.role === 'admin' ? '/admin' : profile.role === 'sotrudnik' ? '/sotrudnik' : '/seller'
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/sellers" element={<ProtectedRoute role="admin"><AdminSellersPage /></ProtectedRoute>} />
      <Route path="/admin/sellers/:id" element={<ProtectedRoute role="admin"><SellerDetailPage /></ProtectedRoute>} />
      <Route path="/admin/stores" element={<ProtectedRoute role="admin"><AdminStoresPage /></ProtectedRoute>} />
      <Route path="/admin/stores/:id" element={<ProtectedRoute role="admin"><StoreDetailPage /></ProtectedRoute>} />
      <Route path="/admin/visits" element={<ProtectedRoute role="admin"><AdminVisitsPage /></ProtectedRoute>} />
      <Route path="/admin/map" element={<ProtectedRoute role="admin"><AdminMapPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReportsPage /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute role="admin"><AdminLogsPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettingsPage /></ProtectedRoute>} />

      {/* Seller */}
      <Route path="/seller" element={<ProtectedRoute role="seller"><SellerDashboardPage /></ProtectedRoute>} />
      <Route path="/seller/stores" element={<ProtectedRoute role="seller"><SellerStoresPage /></ProtectedRoute>} />
      <Route path="/seller/visits" element={<ProtectedRoute role="seller"><SellerVisitsPage /></ProtectedRoute>} />
      <Route path="/seller/map" element={<ProtectedRoute role="seller"><SellerMapPage /></ProtectedRoute>} />
      <Route path="/seller/profile" element={<ProtectedRoute role="seller"><SellerProfilePage /></ProtectedRoute>} />

      {/* Sotrudnik */}
      <Route path="/sotrudnik" element={<ProtectedRoute role="sotrudnik"><SotrudnikDashboard /></ProtectedRoute>} />
      <Route path="/sotrudnik/installations" element={<ProtectedRoute role="sotrudnik"><SotrudnikInstallations /></ProtectedRoute>} />
      <Route path="/sotrudnik/profile" element={<ProtectedRoute role="sotrudnik"><SotrudnikProfile /></ProtectedRoute>} />

      <Route path="/" element={
        profile
          ? <Navigate to={
              profile.role === 'admin' ? '/admin' :
              profile.role === 'sotrudnik' ? '/sotrudnik' :
              '/seller'
            } replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}