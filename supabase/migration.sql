-- ============================================================
-- CRM SAVDO TIZIMI - PostgreSQL Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. STORES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  contact_person TEXT,
  address TEXT,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. VISITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN (
    'bought', 'not_bought', 'will_buy_later',
    'no_money', 'uses_other_app', 'need_manager', 'revisit_needed'
  )),
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stores_seller_id ON public.stores(seller_id);
CREATE INDEX IF NOT EXISTS idx_visits_seller_id ON public.visits(seller_id);
CREATE INDEX IF NOT EXISTS idx_visits_store_id ON public.visits(store_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON public.visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(status);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RLS POLICIES - PROFILES
-- ============================================================
-- Admin: full access
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Seller: own profile only
CREATE POLICY "seller_own_profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "seller_update_own_profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 10. RLS POLICIES - STORES
-- ============================================================
-- Admin: see all
CREATE POLICY "admin_all_stores" ON public.stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Seller: own stores only
CREATE POLICY "seller_own_stores" ON public.stores
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- ============================================================
-- 11. RLS POLICIES - VISITS
-- ============================================================
-- Admin: see all
CREATE POLICY "admin_all_visits" ON public.visits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Seller: own visits only
CREATE POLICY "seller_own_visits" ON public.visits
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- ============================================================
-- 12. RLS POLICIES - LOGS
-- ============================================================
-- Admin: see all logs
CREATE POLICY "admin_all_logs" ON public.logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users: insert own logs
CREATE POLICY "users_insert_own_logs" ON public.logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 13. INITIAL ADMIN USER (run after creating user in Auth)
-- ============================================================
-- After creating admin@crm.uz in Supabase Auth Dashboard, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@crm.uz';

-- ============================================================
-- 14. SAMPLE DATA (Optional - for testing)
-- ============================================================
-- Insert sample visit statuses view
CREATE OR REPLACE VIEW public.visit_statistics AS
SELECT
  p.id as seller_id,
  p.first_name || ' ' || p.last_name as seller_name,
  COUNT(v.id) as total_visits,
  COUNT(CASE WHEN v.status = 'bought' THEN 1 END) as bought,
  COUNT(CASE WHEN v.status = 'not_bought' THEN 1 END) as not_bought,
  COUNT(CASE WHEN v.status = 'will_buy_later' THEN 1 END) as will_buy_later,
  COUNT(CASE WHEN v.status = 'no_money' THEN 1 END) as no_money,
  COUNT(CASE WHEN v.visited_at >= NOW() - INTERVAL '1 day' THEN 1 END) as today_visits,
  COUNT(CASE WHEN v.visited_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_visits,
  COUNT(CASE WHEN v.visited_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_visits
FROM public.profiles p
LEFT JOIN public.visits v ON v.seller_id = p.id
WHERE p.role = 'seller'
GROUP BY p.id, p.first_name, p.last_name;

