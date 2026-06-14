import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export const sellersApi = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(sellerData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone: string
  }) {
    // Create auth user via admin API (requires service role - done via edge function or direct)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sellerData.email,
      password: sellerData.password,
      options: {
        data: {
          first_name: sellerData.first_name,
          last_name: sellerData.last_name,
          role: 'seller',
        },
      },
    })
    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: sellerData.email,
        first_name: sellerData.first_name,
        last_name: sellerData.last_name,
        phone: sellerData.phone,
        role: 'seller',
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('logs').insert({
      user_id: authData.user.id,
      action: 'CREATE_SELLER',
      details: { email: sellerData.email, name: `${sellerData.first_name} ${sellerData.last_name}` },
    })

    return data
  },

  async update(id: string, updates: Partial<Profile>, adminId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: adminId,
      action: 'UPDATE_SELLER',
      details: { seller_id: id, updates },
    })

    return data
  },

  async block(id: string, adminId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'blocked', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: adminId,
      action: 'BLOCK_SELLER',
      details: { seller_id: id },
    })

    return data
  },

  async activate(id: string, adminId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: adminId,
      action: 'ACTIVATE_SELLER',
      details: { seller_id: id },
    })

    return data
  },

  async delete(id: string, adminId: string) {
    await supabase.from('logs').insert({
      user_id: adminId,
      action: 'DELETE_SELLER',
      details: { seller_id: id },
    })

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
