import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export const authApi = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Check if blocked
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile?.status === 'blocked') {
      await supabase.auth.signOut()
      throw new Error('Hisobingiz bloklangan. Admin bilan bog\'laning.')
    }

    // Log login
    await supabase.from('logs').insert({
      user_id: data.user.id,
      action: 'LOGIN',
      details: { email },
    })

    return { user: data.user, profile }
  },

  async logout(userId: string) {
    await supabase.from('logs').insert({
      user_id: userId,
      action: 'LOGOUT',
      details: {},
    })
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error

    await supabase.from('logs').insert({
      user_id: userId,
      action: 'UPDATE_PROFILE',
      details: updates,
    })

    return data
  },
}
