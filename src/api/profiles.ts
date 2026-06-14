import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export const profilesApi = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  async getById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async getSellers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .order('first_name');
    if (error) throw error;
    return data as Profile[];
  },

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async createSeller(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: data.email,
        role: 'seller',
        status: 'active',
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
      });
    if (profileError) throw profileError;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  },
};
