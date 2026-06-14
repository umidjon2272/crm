import { supabase } from '@/lib/supabase'
import type { Visit, FilterParams, DashboardStats } from '@/types'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export const visitsApi = {
  async getAll(filters?: FilterParams): Promise<Visit[]> {
    let query = supabase
      .from('visits')
      .select(`
        *,
        seller:profiles(id, first_name, last_name, email, phone, role, status, avatar_url, created_at, updated_at),
        store:stores(id, store_name, company_name, phone, contact_person, address, notes, latitude, longitude, seller_id, created_at, updated_at)
      `)
      .order('visited_at', { ascending: false })

    if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.startDate) query = query.gte('visited_at', filters.startDate)
    if (filters?.endDate) query = query.lte('visited_at', filters.endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getMine(sellerId: string, filters?: FilterParams): Promise<Visit[]> {
    let query = supabase
      .from('visits')
      .select(`
        *,
        store:stores(id, store_name, company_name, phone, contact_person, address, notes, latitude, longitude, seller_id, created_at, updated_at)
      `)
      .eq('seller_id', sellerId)
      .order('visited_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.startDate) query = query.gte('visited_at', filters.startDate)
    if (filters?.endDate) query = query.lte('visited_at', filters.endDate)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(visit: Omit<Visit, 'id' | 'created_at' | 'seller' | 'store'>) {
    const { data, error } = await supabase
      .from('visits')
      .insert(visit)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: visit.seller_id,
      action: 'CREATE_VISIT',
      details: { visit_id: data.id, store_id: visit.store_id, status: visit.status },
    })

    return data
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date()
    const todayStart = startOfDay(now).toISOString()
    const todayEnd = endOfDay(now).toISOString()
    const weekStart = startOfWeek(now).toISOString()
    const weekEnd = endOfWeek(now).toISOString()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()

    const [sellers, stores, todayVisits, weekVisits, monthVisits, allVisits] = await Promise.all([
      supabase.from('profiles').select('id, status').eq('role', 'seller'),
      supabase.from('stores').select('id'),
      supabase.from('visits').select('id').gte('visited_at', todayStart).lte('visited_at', todayEnd),
      supabase.from('visits').select('id').gte('visited_at', weekStart).lte('visited_at', weekEnd),
      supabase.from('visits').select('id').gte('visited_at', monthStart).lte('visited_at', monthEnd),
      supabase.from('visits').select('status'),
    ])

    const sellerData = sellers.data || []
    const visitStatusCounts = (allVisits.data || []).reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_sellers: sellerData.length,
      active_sellers: sellerData.filter((s) => s.status === 'active').length,
      blocked_sellers: sellerData.filter((s) => s.status === 'blocked').length,
      total_stores: stores.data?.length || 0,
      today_visits: todayVisits.data?.length || 0,
      weekly_visits: weekVisits.data?.length || 0,
      monthly_visits: monthVisits.data?.length || 0,
      visits_by_status: visitStatusCounts as any,
    }
  },
}
