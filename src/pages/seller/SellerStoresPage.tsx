import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Store as StoreIcon, MapPin, Map } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { storesApi } from '@/api/stores'
import { useAuth } from '@/context/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function AddStoreModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { position, getPosition, loading: geoLoading } = useGeolocation()
  const [form, setForm] = useState({
    store_name: '', company_name: '', phone: '',
    contact_person: '', address: '', notes: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [marker, setMarker] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (position) {
      setForm(f => ({ ...f, latitude: position.latitude, longitude: position.longitude }))
      setMarker([position.latitude, position.longitude])
    }
  }, [position])

  const handleMapSelect = (lat: number, lng: number) => {
    setMarker([lat, lng])
    setForm(f => ({ ...f, latitude: lat, longitude: lng }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.store_name || !form.company_name) {
      toast.error("Magazin va firma nomi majburiy")
      return
    }
    setLoading(true)
    try {
      await storesApi.create({ ...form, seller_id: user!.id }, user!.id)
      toast.success("Magazin qo'shildi")
      qc.invalidateQueries({ queryKey: ['my-stores'] })
      onClose()
      setForm({ store_name:'', company_name:'', phone:'', contact_person:'', address:'', notes:'', latitude:null, longitude:null })
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Magazin nomi *" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})} required />
          <Input label="Firma nomi *" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Telefon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Mas'ul shaxs" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} />
        </div>
        <Input label="Manzil" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <Textarea label="Izoh" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

        {/* GPS */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            📍 GPS Lokatsiya
          </label>
          <div className="flex gap-2 mb-3">
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
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700" style={{height: '250px'}}>
              <MapContainer
                center={marker || [41.2995, 69.2401]}
                zoom={13}
                style={{height: '100%', width: '100%'}}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onSelect={handleMapSelect} />
                {marker && <Marker position={marker} />}
              </MapContainer>
            </div>
          )}
          {showMap && (
            <p className="text-xs text-slate-400 mt-1">👆 Xaritada bosib joy belgilang</p>
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
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <StoreIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{store.store_name}</h3>
                    <p className="text-sm text-slate-500 truncate">{store.company_name}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  {store.contact_person && <p>👤 {store.contact_person}</p>}
                  {store.phone && <p>📞 {store.phone}</p>}
                  {store.address && <p className="truncate">📍 {store.address}</p>}
                  {store.latitude && (
                    <a href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer" className="text-green-600 text-xs hover:underline">
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