import { supabase } from '@/lib/supabase'
import type { Store, FilterParams } from '@/types'

export const storesApi = {
  async getAll(filters?: FilterParams): Promise<Store[]> {
    let query = supabase
      .from('stores')
      .select('*, seller:profiles(id, first_name, last_name, email, phone, role, status, avatar_url, created_at, updated_at)')
      .order('created_at', { ascending: false })

    if (filters?.sellerId) {
      query = query.eq('seller_id', filters.sellerId)
    }
    if (filters?.storeName) {
      query = query.ilike('store_name', `%${filters.storeName}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getMine(sellerId: string): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Store> {
    const { data, error } = await supabase
      .from('stores')
      .select('*, seller:profiles(id, first_name, last_name, email, phone, role, status, avatar_url, created_at, updated_at)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(store: Omit<Store, 'id' | 'created_at' | 'updated_at' | 'seller'>, userId: string) {
    const { data, error } = await supabase
      .from('stores')
      .insert(store)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: userId,
      action: 'CREATE_STORE',
      details: { store_id: data.id, store_name: store.store_name },
    })

    return data
  },

  async update(id: string, updates: Partial<Store>, userId: string) {
    const { data, error } = await supabase
      .from('stores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: userId,
      action: 'UPDATE_STORE',
      details: { store_id: id, updates },
    })

    return data
  },

  async delete(id: string, userId: string) {
    await supabase.from('logs').insert({
      user_id: userId,
      action: 'DELETE_STORE',
      details: { store_id: id },
    })

    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (error) throw error
  },
}
