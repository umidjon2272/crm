import { supabase } from '@/lib/supabase'
import type { CustomRole } from '@/types'

export const customRolesApi = {
  async getAll(): Promise<CustomRole[]> {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(role: Omit<CustomRole, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('custom_roles')
      .insert(role)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<CustomRole>) {
    const { data, error } = await supabase
      .from('custom_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('custom_roles')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}