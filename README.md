# CRM Savdo Tizimi

Professional CRM web ilovasi - savdo agentlari (sotuvchilar) faoliyatini nazorat qilish va hisobot yuritish.

## Texnologiyalar

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query v5)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Map**: Leaflet + OpenStreetMap
- **Charts**: Recharts

## O'rnatish

### 1. Supabase Loyiha Yaratish

1. [supabase.com](https://supabase.com) ga boring
2. Yangi loyiha yarating
3. `supabase/migration.sql` faylini SQL Editor da bajaring
4. Authentication > Email Auth ni yoqing

### 2. Admin Foydalanuvchi Yaratish

1. Supabase Dashboard > Authentication > Users > Invite User
2. Email: `admin@crm.uz`, parol kiriting
3. SQL Editor da bajaring:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@crm.uz';
```

### 3. Proyektni O'rnatish

```bash
# O'rnatish
npm install

# .env fayl yarating
cp .env.example .env
# VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni to'ldiring

# Ishga tushirish
npm run dev
```

### 4. .env Fayl

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Loyiha Tuzilishi

```
src/
├── api/           # Supabase API funksiyalari
│   ├── auth.ts
│   ├── sellers.ts
│   ├── stores.ts
│   └── visits.ts
├── components/
│   ├── ui/        # Qayta ishlatiladigan UI komponentlar
│   ├── layout/    # Sahifa joylashuvi
│   └── map/       # Leaflet xarita
├── context/       # React Context (Auth)
├── hooks/         # Custom hooklar
├── lib/           # Supabase client, utility funksiyalar
├── pages/
│   ├── admin/     # Admin sahifalari
│   └── seller/    # Sotuvchi sahifalari
└── types/         # TypeScript turlari
```

## Imkoniyatlar

### Admin
- Dashboard (statistikalar, grafiklar)
- Sotuvchilarni boshqarish (qo'shish, bloklash, o'chirish)
- Barcha magazinlarni ko'rish
- Barcha tashriflarni ko'rish va filtrlash
- Xaritada barcha tashriflar
- Hisobotlar (kunlik, haftalik, oylik)
- Loglar tizimi

### Sotuvchi
- Dashboard (o'z statistikalari)
- Magazin qo'shish (GPS bilan)
- Tashrif kiritish (GPS + holat)
- O'z tarixini ko'rish
- Xaritada o'z tashriflari
- Profil tahrirlash

## Xavfsizlik

- Supabase RLS (Row Level Security)
- Seller faqat o'z ma'lumotlarini ko'radi
- Bloklangan foydalanuvchi kira olmaydi
- JWT token autentifikatsiya

## Dark Mode

Ilovada Dark/Light mode o'tish tugmasi mavjud (header da).
