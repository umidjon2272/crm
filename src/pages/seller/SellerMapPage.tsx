import React, { useState } from 'react'
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

function LocationBtn({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap()
  const handle = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 16)
      onLocate(pos.coords.latitude, pos.coords.longitude)
    })
  }
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
      <div className="leaflet-control leaflet-bar">
        <button onClick={handle} title="Mening joylashuvim"
          style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'white', border:'none', cursor:'pointer', fontSize:18 }}>
          📍
        </button>
      </div>
    </div>
  )
}

function colorIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14,14], iconAnchor: [7,7], className:''
  })
}

function myIcon() {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px #3b82f6aa"></div>`,
    iconSize: [18,18], iconAnchor: [9,9], className:''
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

  const withCoords = visits.filter(v => v.latitude && v.longitude)

  return (
    <Layout title="Xarita">
      <div className="space-y-3">
        <p className="text-sm text-slate-500">{withCoords.length} ta tashrif • 📍 tugmani bosing — joylashuvingizni ko'ring</p>
        <div style={{ height: 'calc(100vh - 200px)' }} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <MapContainer center={[41.2995, 69.2401]} zoom={12} style={{ height:'100%', width:'100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <LocationBtn onLocate={(lat, lng) => setMyPos([lat, lng])} />

            {myPos && (
              <Marker position={myPos} icon={myIcon()}>
                <Popup>
                  <div style={{ fontSize:13 }}>
                    <p style={{ fontWeight:700 }}>📍 Mening joylashuvim</p>
                    <p style={{ color:'#64748b', fontSize:11 }}>{myPos[0].toFixed(5)}, {myPos[1].toFixed(5)}</p>
                    <a href={`https://yandex.com/maps/?pt=${myPos[1]},${myPos[0]}&z=16`} target="_blank" rel="noreferrer" style={{ color:'#ef4444', fontSize:12, display:'block', marginTop:4 }}>
                      🚕 Yandex Maps
                    </a>
                    <a href={`https://maps.google.com/?q=${myPos[0]},${myPos[1]}`} target="_blank" rel="noreferrer" style={{ color:'#3b82f6', fontSize:12, display:'block', marginTop:2 }}>
                      🗺️ Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            )}

            {withCoords.map(visit => (
              <Marker key={visit.id} position={[visit.latitude!, visit.longitude!]} icon={colorIcon(VISIT_STATUS_COLORS[visit.status as VisitStatus] || '#3b82f6')}>
                <Popup>
                  <div style={{ minWidth:160, fontSize:13 }}>
                    <p style={{ fontWeight:700 }}>{visit.store?.store_name}</p>
                    <p style={{ color:'#64748b', marginBottom:4 }}>{visit.store?.company_name}</p>
                    <p style={{ color: VISIT_STATUS_COLORS[visit.status as VisitStatus] }}>{VISIT_STATUS_LABELS[visit.status as VisitStatus]}</p>
                    <p style={{ fontSize:11, color:'#94a3b8' }}>{formatDate(visit.visited_at)}</p>
                    <a href={`https://yandex.com/maps/?pt=${visit.longitude},${visit.latitude}&z=16`} target="_blank" rel="noreferrer" style={{ color:'#ef4444', fontSize:12, display:'block', marginTop:4 }}>
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