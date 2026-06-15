import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { visitsApi } from '@/api/visits'
import { storesApi } from '@/api/stores'
import { sellersApi } from '@/api/sellers'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS, STORE_STATUS_LABELS, STORE_STATUS_COLORS } from '@/types'
import type { VisitStatus, StoreStatus } from '@/types'
import { formatDate } from '@/lib/utils'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function colorIcon(color: string, shape = 'circle') {
  const html = shape === 'square'
    ? `<div style="width:14px;height:14px;border-radius:3px;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`
    : `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`
  return L.divIcon({ html, iconSize: [14, 14], iconAnchor: [7, 7], className: '' })
}

function myIcon() {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px #3b82f6aa"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], className: ''
  })
}

function LocationBtn({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap()
  const handle = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 14)
      onLocate(pos.coords.latitude, pos.coords.longitude)
    })
  }
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <button onClick={handle} title="Mening joylashuvim"
          style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: 'none', cursor: 'pointer', fontSize: 18 }}>
          📍
        </button>
      </div>
    </div>
  )
}

export function AdminMapPage() {
  const [sellerId, setSellerId] = useState('')
  const [visitStatus, setVisitStatus] = useState('')
  const [showVisits, setShowVisits] = useState(true)
  const [showStores, setShowStores] = useState(true)
  const [myPos, setMyPos] = useState<[number, number] | null>(null)

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', { sellerId, visitStatus }],
    queryFn: () => visitsApi.getAll({ sellerId: sellerId || undefined, status: (visitStatus as VisitStatus) || undefined }),
  })

  const { data: stores = [] } = useQuery({
    queryKey: ['stores', { sellerId }],
    queryFn: () => storesApi.getAll({ sellerId: sellerId || undefined }),
  })

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  })

  const visitsWithCoords = visits.filter(v => v.latitude && v.longitude)
  const storesWithCoords = stores.filter(s => s.latitude && s.longitude)

  return (
    <Layout title="Xarita">
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <select value={sellerId} onChange={e => setSellerId(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Barcha sotuvchilar</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>

          <select value={visitStatus} onChange={e => setVisitStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Barcha holatlar</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showVisits} onChange={e => setShowVisits(e.target.checked)} className="rounded" />
            🔵 Tashriflar ({visitsWithCoords.length})
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showStores} onChange={e => setShowStores(e.target.checked)} className="rounded" />
            🟥 Magazinlar ({storesWithCoords.length})
          </label>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {showVisits && Object.entries(VISIT_STATUS_LABELS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full" style={{ background: VISIT_STATUS_COLORS[k as VisitStatus] }} />
              {v}
            </div>
          ))}
          {showStores && Object.entries(STORE_STATUS_LABELS || {}).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-sm" style={{ background: STORE_STATUS_COLORS?.[k as StoreStatus] || '#6b7280' }} />
              {v}
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={{ height: 'calc(100vh - 260px)' }} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <MapContainer center={[41.2995, 69.2401]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <LocationBtn onLocate={(lat, lng) => setMyPos([lat, lng])} />

            {/* My location */}
            {myPos && (
              <Marker position={myPos} icon={myIcon()}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <p style={{ fontWeight: 700 }}>📍 Mening joylashuvim</p>
                    <p style={{ color: '#64748b', fontSize: 11 }}>{myPos[0].toFixed(5)}, {myPos[1].toFixed(5)}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Stores */}
            {showStores && storesWithCoords.map(store => (
              <Marker
                key={store.id}
                position={[store.latitude!, store.longitude!]}
                icon={colorIcon(STORE_STATUS_COLORS?.[store.status as StoreStatus] || '#6b7280', 'square')}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontSize: 13 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>🏪 {store.store_name}</p>
                    <p style={{ color: '#64748b', marginBottom: 6 }}>{store.company_name}</p>
                    {store.phone && <p>📞 {store.phone}</p>}
                    {store.address && <p>📍 {store.address}</p>}
                    {store.seller && <p>👤 {store.seller.first_name} {store.seller.last_name}</p>}
                    <a href={`https://yandex.com/maps/?pt=${store.longitude},${store.latitude}&z=16`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#ef4444', fontSize: 12, display: 'block', marginTop: 6 }}>
                      🚕 Yandex Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Visits */}
            {showVisits && visitsWithCoords.map(visit => (
              <Marker
                key={visit.id}
                position={[visit.latitude!, visit.longitude!]}
                icon={colorIcon(VISIT_STATUS_COLORS[visit.status as VisitStatus] || '#3b82f6')}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontSize: 13 }}>
                    <p style={{ fontWeight: 700 }}>{visit.store?.store_name}</p>
                    <p style={{ color: '#64748b', marginBottom: 4 }}>{visit.store?.company_name}</p>
                    <p>👤 {visit.seller?.first_name} {visit.seller?.last_name}</p>
                    <p style={{ color: VISIT_STATUS_COLORS[visit.status as VisitStatus] }}>
                      {VISIT_STATUS_LABELS[visit.status as VisitStatus]}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(visit.visited_at)}</p>
                    <a href={`https://yandex.com/maps/?pt=${visit.longitude},${visit.latitude}&z=16`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#ef4444', fontSize: 12, display: 'block', marginTop: 4 }}>
                      🚕 Yandex Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <p className="text-sm text-slate-500">
          🔵 {visitsWithCoords.length} tashrif • 🟥 {storesWithCoords.length} magazin xaritada
        </p>
      </div>
    </Layout>
  )
}