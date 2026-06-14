import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Store, MapPin, TrendingUp, UserCheck, UserX, Calendar, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import { StatCard, Spinner, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS, type VisitStatus } from '@/types';
import { formatDateTime } from '@/utils';

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#f97316', '#8b5cf6', '#3b82f6', '#6b7280'];

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['visits-chart'],
    queryFn: () => dashboardApi.getVisitsChartData(30),
  });

  const { data: recentVisits, isLoading: visitsLoading } = useQuery({
    queryKey: ['recent-visits'],
    queryFn: () => dashboardApi.getRecentVisits(8),
    refetchInterval: 30000,
  });

  const { data: logs } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => dashboardApi.getActivityLogs(10),
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const pieData = stats ? Object.entries(stats.visitsByStatus).map(([key, value]) => ({
    name: VISIT_STATUS_LABELS[key as VisitStatus],
    value,
  })) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Umumiy ko'rsatkichlar va statistikalar"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Jami Sotuvchilar"
          value={stats?.totalSellers || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Aktiv Sotuvchilar"
          value={stats?.activeSellers || 0}
          icon={<UserCheck className="w-6 h-6 text-green-600" />}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="Bloklangan"
          value={stats?.blockedSellers || 0}
          icon={<UserX className="w-6 h-6 text-red-600" />}
          color="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard
          title="Jami Magazinlar"
          value={stats?.totalStores || 0}
          icon={<Store className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Bugungi Tashriflar"
          value={stats?.todayVisits || 0}
          icon={<MapPin className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          title="Haftalik Tashriflar"
          value={stats?.weekVisits || 0}
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          title="Oylik Tashriflar"
          value={stats?.monthVisits || 0}
          icon={<TrendingUp className="w-6 h-6 text-teal-600" />}
          color="bg-teal-50 dark:bg-teal-900/20"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            So'nggi 30 kunlik tashriflar
          </h3>
          {chartLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData || []}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-gray-500" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-opacity)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorVisits)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Holat bo'yicha
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </div>
      </div>

      {/* Recent visits + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">So'nggi Tashriflar</h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          {visitsLoading ? (
            <div className="flex items-center justify-center h-32"><Spinner /></div>
          ) : (
            <div className="space-y-3">
              {(recentVisits || []).map((v: {
                id: string;
                status: VisitStatus;
                visited_at: string;
                seller?: { first_name: string; last_name: string } | null;
                store?: { name: string } | null;
              }) => (
                <div key={v.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {v.store?.name || 'Noma\'lum'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.seller?.first_name} {v.seller?.last_name} · {formatDateTime(v.visited_at)}
                    </p>
                  </div>
                  <Badge className={VISIT_STATUS_COLORS[v.status]}>
                    {VISIT_STATUS_LABELS[v.status]}
                  </Badge>
                </div>
              ))}
              {!recentVisits?.length && (
                <p className="text-sm text-gray-500 text-center py-8">Tashriflar yo'q</p>
              )}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Faoliyat Tarixi</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {(logs || []).map((log: {
              id: string;
              action: string;
              created_at: string;
              user?: { first_name: string; last_name: string; role: string } | null;
            }) => (
              <div key={log.id} className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{log.user?.first_name} {log.user?.last_name}</span>
                    {' '}{getActionLabel(log.action)}
                  </p>
                  <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                </div>
              </div>
            ))}
            {!logs?.length && (
              <p className="text-sm text-gray-500 text-center py-8">Faoliyat yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    login: 'tizimga kirdi',
    logout: 'tizimdan chiqdi',
    store_created: 'yangi magazin qo\'shdi',
    store_deleted: 'magazin o\'chirdi',
    visit_created: 'tashrif kiritdi',
    visit_deleted: 'tashrifni o\'chirdi',
  };
  return labels[action] || action;
}
