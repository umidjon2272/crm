import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rctejxgmxlknaztzxxft.supabase.co'
const supabaseAnonKey = 'sb_publishable_qDSBHWSDPEGKmhbCy2kxuA_8rs56TfO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'crm-auth-session',
    storage: window.localStorage,
  },
})