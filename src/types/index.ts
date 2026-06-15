export type UserRole = 'admin' | 'seller' | 'sotrudnik'
export type UserStatus = 'active' | 'blocked'

export type VisitStatus =
  | 'bought'
  | 'not_bought'
  | 'will_buy_later'
  | 'no_money'
  | 'uses_other_app'
  | 'need_manager'
  | 'revisit_needed'

export type InstallationStatus = 'installed' | 'not_installed' | 'problem' | 'paid' | 'not_paid'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  status: UserStatus
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  seller_id: string
  store_name: string
  company_name: string
  phone: string | null
  contact_person: string | null
  address: string | null
  notes: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  seller?: Profile
}

export interface Visit {
  id: string
  seller_id: string
  store_id: string
  status: VisitStatus
  notes: string | null
  latitude: number | null
  longitude: number | null
  visited_at: string
  created_at: string
  seller?: Profile
  store?: Store
}

export interface Installation {
  id: string
  sotrudnik_id: string
  store_id: string
  visit_id: string | null
  status: InstallationStatus
  notes: string | null
  latitude: number | null
  longitude: number | null
  installed_at: string
  created_at: string
  sotrudnik?: Profile
  store?: Store
  visit?: Visit
}

export interface Log {
  id: string
  user_id: string
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  user?: Profile
}

export interface DashboardStats {
  total_sellers: number
  active_sellers: number
  blocked_sellers: number
  total_stores: number
  today_visits: number
  weekly_visits: number
  monthly_visits: number
  visits_by_status: Record<VisitStatus, number>
}

export interface FilterParams {
  startDate?: string
  endDate?: string
  sellerId?: string
  status?: VisitStatus
  storeName?: string
}

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  bought: 'Mahsulot oldi',
  not_bought: 'Mahsulot olmadi',
  will_buy_later: 'Keyinroq oladi',
  no_money: "Puli yo'q",
  uses_other_app: 'Boshqa dastur ishlatyapti',
  need_manager: 'Rahbar bilan gaplashish kerak',
  revisit_needed: 'Qayta tashrif kerak',
}

export const VISIT_STATUS_COLORS: Record<VisitStatus, string> = {
  bought: '#22c55e',
  not_bought: '#ef4444',
  will_buy_later: '#f59e0b',
  no_money: '#6b7280',
  uses_other_app: '#8b5cf6',
  need_manager: '#3b82f6',
  revisit_needed: '#f97316',
}

export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, string> = {
  installed: "O'rnatildi",
  not_installed: "O'rnatilmadi",
  problem: 'Muammo bor',
  paid: "Pul to'landi",
  not_paid: "Pul to'lanmadi",
}

export const INSTALLATION_STATUS_COLORS: Record<InstallationStatus, string> = {
  installed: '#22c55e',
  not_installed: '#ef4444',
  problem: '#f97316',
  paid: '#3b82f6',
  not_paid: '#6b7280',
}