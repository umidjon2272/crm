import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { visitsApi } from '@/api/visits'
import { useAuth } from '@/context/AuthContext'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import type { VisitStatus } from '@/types'
import { formatDate } from '@/lib/utils'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MyLocationButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap()

  const handleClick = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo([latitude, longitude], 16)
        onLocate(latitude, longitude)
      },
      () => alert("Lokatsiya olishda xatolik")
    )
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleClick}
          title="Mening joylashuvim"
          style={{
            width: '34px', height: '34px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'white', border: 'none', cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          📍
        </button>
      </div>
    </div>
  )
}

function createColorIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7], className: ''
  })
}

function createMyLocationIcon() {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px #3b82f6aa;"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], className: ''
  })
}

export function SellerMapPage() {
  const { user } = useAuth()
  const [myPos, setMyPos] = useState<[number, number] | null>(null)

  const { data: visits = [] } = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: () => visitsApi.getMine(user!.id),
    enabled: !!user,
  })

  const visitsWithCoords = visits.filter(v => v.latitude && v.longitude)

  return (
    <Layout title="Xarita">
      <div className="space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-slate-500">
            {visitsWithCoords.length} ta tashrif ko'rsatilmoqda
          </p>
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-300" />
            Mening joylashuvim
          </div>
        </div>

        <div style={{ height: 'calc(100vh - 200px)' }}
          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <MapContainer
            center={[41.2995, 69.2401]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <MyLocationButton onLocate={(lat, lng) => setMyPos([lat, lng])} />

            {/* Mening joylashuvim */}
            {myPos && (
              <Marker position={myPos} icon={createMyLocationIcon()}>
                <Popup>
                  <div style={{ fontSize: '13px' }}>
                    <p style={{ fontWeight: 700 }}>📍 Mening joylashuvim</p>
                    <p style={{ color: '#64748b', fontSize: '11px' }}>
                      {myPos[0].toFixed(5)}, {myPos[1].toFixed(5)}
                    </p>
                    
                      href={`https://yandex.com/maps/?pt=${myPos[1]},${myPos[0]}&z=16&l=map`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#ef4444', fontSize: '12px' }}
                    >
                      🚕 Yandex Taksida ko'rish
                    </a>
                    <br />
                    
                      href={`https://maps.google.com/?q=${myPos[0]},${myPos[1]}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#3b82f6', fontSize: '12px' }}
                    >
                      🗺️ Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Tashriflar */}
            {visitsWithCoords.map(visit => (
              <Marker
                key={visit.id}
                position={[visit.latitude!, visit.longitude!]}
                icon={createColorIcon(VISIT_STATUS_COLORS[visit.status as VisitStatus] || '#3b82f6')}
              >
                <Popup>
                  <div style={{ minWidth: '160px', fontSize: '13px' }}>
                    <p style={{ fontWeight: 700 }}>{visit.store?.store_name}</p>
                    <p style={{ color: '#64748b', marginBottom: '6px' }}>{visit.store?.company_name}</p>
                    <p style={{ color: VISIT_STATUS_COLORS[visit.status as VisitStatus] }}>
                      {VISIT_STATUS_LABELS[visit.status as VisitStatus]}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(visit.visited_at)}</p>
                    
                      href={`https://yandex.com/maps/?pt=${visit.longitude},${visit.latitude}&z=16`}
                      target="_blank" rel="noreferrer"
                      style={{ color: '#ef4444', fontSize: '12px' }}
                    >
                      🚕 Yandex Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </Layout>
  )
}