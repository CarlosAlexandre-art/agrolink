'use client'

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
}: Props) {
  const delta = 0.018
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Mapa */}
      <div className="relative" style={{ height: 220 }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          title="Localização do serviço"
        />
      </div>

      {/* Endereço + botões de navegação */}
      <div className="bg-white px-4 py-3 border-t border-gray-100">
        {(nomeFazenda || endereco) && (
          <div className="text-sm text-gray-600 mb-3">
            {nomeFazenda && <span className="font-medium text-gray-800">🌾 {nomeFazenda} · </span>}
            {endereco && <span>{endereco}</span>}
          </div>
        )}
        <div className="flex gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition"
          >
            🗺️ Rota no Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            🚗 Waze
          </a>
        </div>
      </div>
    </div>
  )
}
