import { supabase } from '@/lib/supabase'
import type { Installation, InstallationStatus } from '@/types'

export const installationsApi = {
  async getAll(filters?: { sotrudnikId?: string; storeId?: string; status?: InstallationStatus }): Promise<Installation[]> {
    let query = supabase
      .from('installations')
      .select(`
        *,
        sotrudnik:profiles(id, first_name, last_name, email, phone, role, status, avatar_url, created_at, updated_at),
        store:stores(id, store_name, company_name, phone, contact_person, address, notes, latitude, longitude, seller_id, created_at, updated_at)
      `)
      .order('installed_at', { ascending: false })

    if (filters?.sotrudnikId) query = query.eq('sotrudnik_id', filters.sotrudnikId)
    if (filters?.storeId) query = query.eq('store_id', filters.storeId)
    if (filters?.status) query = query.eq('status', filters.status)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getMine(sotrudnikId: string): Promise<Installation[]> {
    const { data, error } = await supabase
      .from('installations')
      .select(`
        *,
        store:stores(id, store_name, company_name, phone, contact_person, address, notes, latitude, longitude, seller_id, created_at, updated_at)
      `)
      .eq('sotrudnik_id', sotrudnikId)
      .order('installed_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(data: Omit<Installation, 'id' | 'created_at' | 'sotrudnik' | 'store' | 'visit'>) {
    const { data: result, error } = await supabase
      .from('installations')
      .insert(data)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: data.sotrudnik_id,
      action: 'CREATE_INSTALLATION',
      details: { store_id: data.store_id, status: data.status },
    })

    return result
  },

  async update(id: string, updates: Partial<Installation>, userId: string) {
    const { data, error } = await supabase
      .from('installations')
      .update({ ...updates })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: userId,
      action: 'UPDATE_INSTALLATION',
      details: { installation_id: id, updates },
    })

    return data
  },
}