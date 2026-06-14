import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      sellersRes,
      activeSellersRes,
      blockedSellersRes,
      storesRes,
      todayRes,
      weekRes,
      monthRes,
      statusRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller').eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller').eq('status', 'blocked'),
      supabase.from('stores').select('*', { count: 'exact', head: true }),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', todayStart),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', weekStart),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', monthStart),
      supabase.from('visits').select('status'),
    ]);

    const statusCounts: Record<string, number> = {};
    (statusRes.data || []).forEach((v: { status: string }) => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
    });

    return {
      totalSellers: sellersRes.count || 0,
      activeSellers: activeSellersRes.count || 0,
      blockedSellers: blockedSellersRes.count || 0,
      totalStores: storesRes.count || 0,
      todayVisits: todayRes.count || 0,
      weekVisits: weekRes.count || 0,
      monthVisits: monthRes.count || 0,
      visitsByStatus: statusCounts as DashboardStats['visitsByStatus'],
    };
  },

  async getRecentVisits(limit = 10) {
    const { data, error } = await supabase
      .from('visits')
      .select('*, seller:profiles!visits_seller_id_fkey(first_name, last_name), store:stores!visits_store_id_fkey(name)')
      .order('visited_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getActivityLogs(limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, user:profiles!activity_logs_user_id_fkey(first_name, last_name, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getVisitsChartData(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data, error } = await supabase
      .from('visits')
      .select('visited_at, status')
      .gte('visited_at', from.toISOString())
      .order('visited_at');
    if (error) throw error;

    // Group by date
    const grouped: Record<string, number> = {};
    data?.forEach(v => {
      const date = v.visited_at.split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  },
};
