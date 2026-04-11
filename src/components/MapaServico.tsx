'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const iconeFazenda = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface Props {
  latitude: number
  longitude: number
  endereco?: string | null
  nomeFazenda?: string | null
  prestadorLat?: number | null
  prestadorLng?: number | null
  prestadorNome?: string | null
}

export default function MapaServico({
  latitude,
  longitude,
  endereco,
  nomeFazenda,
  prestadorLat,
  prestadorLng,
  prestadorNome,
}: Props) {
  const [erroTile, setErroTile] = useState(false)
  const temPrestador = prestadorLat && prestadorLng

  if (erroTile) {
    return (
      <div
        className="rounded-2xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 text-center px-4"
        style={{ height: 260 }}
      >
        <div className="text-4xl">🗺️</div>
        <div className="text-gray-600 font-medium text-sm">Mapa indisponível no momento</div>
        <div className="text-gray-400 text-xs">Verifique sua conexão com a internet</div>
        <button
          onClick={() => setErroTile(false)}
          className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 260 }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setErroTile(true) }}
        />

        <Marker position={[latitude, longitude]} icon={iconeFazenda}>
          <Popup>
            <div className="text-sm font-semibold">📍 Local do Serviço</div>
            {nomeFazenda && <div className="text-xs text-gray-600">{nomeFazenda}</div>}
            {endereco && <div className="text-xs text-gray-500 mt-0.5">{endereco}</div>}
          </Popup>
        </Marker>

        <Circle
          center={[latitude, longitude]}
          radius={1000}
          pathOptions={{ color: '#15803d', fillColor: '#15803d', fillOpacity: 0.08, weight: 1.5 }}
        />

        {temPrestador && (
          <Marker position={[prestadorLat!, prestadorLng!]}>
            <Popup>
              <div className="text-sm font-semibold">🔧 {prestadorNome || 'Prestador'}</div>
              <div className="text-xs text-gray-500">Localização do prestador</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
