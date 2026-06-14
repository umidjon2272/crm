import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Visit } from '@/types'
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/types'
import { formatDate } from '@/lib/utils'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createColoredIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
  })
}

interface VisitsMapProps {
  visits: Visit[]
  center?: [number, number]
  zoom?: number
  height?: string
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(center, map.getZoom()) }, [center, map])
  return null
}

export function VisitsMap({ visits, center = [41.2995, 69.2401], zoom = 12, height = '500px' }: VisitsMapProps) {
  const visitsWithCoords = visits.filter((v) => v.latitude && v.longitude)
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <RecenterMap center={center} />
        {visitsWithCoords.map((visit) => (
          <Marker
            key={visit.id}
            position={[visit.latitude!, visit.longitude!]}
            icon={createColoredIcon(VISIT_STATUS_COLORS[visit.status as keyof typeof VISIT_STATUS_COLORS] || '#3b82f6')}
          >
            <Popup>
              <div style={{ minWidth: '180px', fontSize: '13px' }}>
                <p style={{ fontWeight: 700, marginBottom: '4px' }}>{visit.store?.store_name}</p>
                <p style={{ color: '#64748b', marginBottom: '8px' }}>{visit.store?.company_name}</p>
                <p><strong>Sotuvchi:</strong> {visit.seller?.first_name} {visit.seller?.last_name}</p>
                <p><strong>Holat:</strong> <span style={{ color: VISIT_STATUS_COLORS[visit.status as keyof typeof VISIT_STATUS_COLORS] }}>{VISIT_STATUS_LABELS[visit.status as keyof typeof VISIT_STATUS_LABELS]}</span></p>
                <p><strong>Vaqt:</strong> {formatDate(visit.visited_at)}</p>
                {visit.notes && <p style={{ marginTop: '4px', color: '#64748b' }}>{visit.notes}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
