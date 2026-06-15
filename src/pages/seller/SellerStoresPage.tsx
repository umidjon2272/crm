import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Store as StoreIcon, MapPin, Map } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatDate } from '@/lib/utils'
import { STORE_STATUS_LABELS, STORE_STATUS_COLORS } from '@/types'
import type { StoreStatus } from '@/types'
import toast from 'react-hot-toast'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onSelect(e.latlng.lat, e.latlng.lng) } })
  return null
}

const initialForm = {
  store_name: '', company_name: '', owner_name: '', phone: '',
  contact_person: '', address: '', notes: '', products: '',
  has_program: false, interested_in_program: 'unknown',
  seller_count: 1, status: 'new' as StoreStatus,
  latitude: null as number | null, longitude: null as number | null,
}

function AddStoreModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { position, getPosition, loading: geoLoading } = useGeolocation()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [marker, setMarker] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (position) {
      setForm(f => ({ ...f, latitude: position.latitude, longitude: position.longitude }))
      setMarker([position.latitude, position.longitude])
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_name || !form.company_name) { toast.error("Magazin va firma nomi majburiy"); return }
    setLoading(true)
    try {
      await storesApi.create({ ...form, seller_id: user!.id }, user!.id)
      toast.success("Magazin qo'shildi")
      qc.invalidateQueries({ queryKey: ['my-stores'] })
      onClose()
      setForm(initialForm)
      setMarker(null)
      setShowMap(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi Magazin Qo'shish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Asosiy ma'lumotlar */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Magazin nomi *" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})} required />
          <Input label="Firma nomi *" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Magazin egasi ismi" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} />
          <Input label="Telefon raqami" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+998901234567" />
        </div>
        <Input label="Manzil" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <Textarea label="Magazin mahsulotlari" value={form.products} onChange={e => setForm({...form, products: e.target.value})} placeholder="Qanday mahsulotlar sotadi..." />

        {/* Sotuvchilar soni */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sotuvchilar soni"
            type="number"
            min={1}
            value={form.seller_count}
            onChange={e => setForm({...form, seller_count: parseInt(e.target.value) || 1})}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Holat</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value as StoreStatus})}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
              {Object.entries(STORE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Dastur holati */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dastur bor/yo'q</label>
            <select value={form.has_program ? 'yes' : 'no'} onChange={e => setForm({...form, has_program: e.target.value === 'yes'})}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
              <option value="no">Yo'q</option>
              <option value="yes">Bor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dasturga qiziqishi</label>
            <select value={form.interested_in_program} onChange={e => setForm({...form, interested_in_program: e.target.value})}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
              <option value="unknown">Noma'lum</option>
              <option value="yes">Ha, qiziqadi</option>
              <option value="no">Yo'q, qiziqmaydi</option>
              <option value="maybe">Balki</option>
            </select>
          </div>
        </div>

        <Textarea label="Izoh" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Qo'shimcha izoh..." />

        {/* GPS */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">📍 GPS Lokatsiya</label>
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button type="button" variant="secondary" size="sm" isLoading={geoLoading} onClick={getPosition} leftIcon={<MapPin className="w-4 h-4" />}>
              Avtomatik olish
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowMap(!showMap)} leftIcon={<Map className="w-4 h-4" />}>
              {showMap ? 'Xaritani yopish' : 'Xaritadan tanlash'}
            </Button>
            {form.latitude && (
              <span className="text-xs text-green-600 font-medium flex items-center">
                ✓ {form.latitude.toFixed(4)}, {form.longitude?.toFixed(4)}
              </span>
            )}
          </div>
          {showMap && (
            <>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700" style={{height: '220px'}}>
                <MapContainer center={marker || [41.2995, 69.2401]} zoom={13} style={{height:'100%',width:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onSelect={(lat, lng) => { setMarker([lat, lng]); setForm(f => ({...f, latitude: lat, longitude: lng})) }} />
                  {marker && <Marker position={marker} />}
                </MapContainer>
              </div>
              <p className="text-xs text-slate-400 mt-1">👆 Xaritada bosib joy belgilang</p>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button type="submit" isLoading={loading} className="flex-1">Saqlash</Button>
        </div>
      </form>
    </Modal>
  )
}

export function SellerStoresPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['my-stores', user?.id],
    queryFn: () => storesApi.getMine(user!.id),
    enabled: !!user,
  })

  const filtered = stores.filter(s =>
    `${s.store_name} ${s.company_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Mening Magazinlarim">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Magazin qidirish..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Qo'shish</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <StoreIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Magazin topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(store => (
              <Card key={store.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <StoreIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{store.store_name}</h3>
                      <p className="text-sm text-slate-500 truncate">{store.company_name}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0"
                    style={{ background: (STORE_STATUS_COLORS[store.status as StoreStatus] || '#6b7280') + '20', color: STORE_STATUS_COLORS[store.status as StoreStatus] || '#6b7280' }}>
                    {STORE_STATUS_LABELS[store.status as StoreStatus] || store.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {(store as any).owner_name && <p>👤 {(store as any).owner_name}</p>}
                  {store.phone && <p>📞 {store.phone}</p>}
                  {store.address && <p className="truncate">📍 {store.address}</p>}
                  {(store as any).products && <p className="truncate text-xs">📦 {(store as any).products}</p>}
                  <div className="flex gap-3 text-xs">
                    {(store as any).has_program !== null && (
                      <span className={(store as any).has_program ? 'text-green-600' : 'text-red-500'}>
                        {(store as any).has_program ? '✓ Dastur bor' : '✗ Dastur yo\'q'}
                      </span>
                    )}
                    {(store as any).seller_count && <span>👥 {(store as any).seller_count} sotuvchi</span>}
                  </div>
                  {store.latitude && (
                    <a href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer" className="text-green-600 text-xs hover:underline block">
                      ✓ GPS saqlangan — Ko'rish
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-3">{formatDate(store.created_at, 'dd.MM.yyyy')}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AddStoreModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </Layout>
  )
}