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

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x, y }
}

// Pixel offset do centro do ponto dentro do tile
function latLngToPixelOffset(lat: number, lng: number, zoom: number, tileX: number, tileY: number) {
  const n = Math.pow(2, zoom)
  const px = ((lng + 180) / 360 * n - tileX) * 256
  const latRad = (lat * Math.PI) / 180
  const py = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - tileY) * 256
  return { px, py }
}

export default function MapaServico({ latitude, longitude, endereco, nomeFazenda, prestadorLat: _prestadorLat, prestadorLng: _prestadorLng, prestadorNome: _prestadorNome }: Props) {
  const zoom = 14
  const { x, y } = latLngToTile(latitude, longitude, zoom)

  // Grid 3x3 de tiles centrado
  const tiles = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({ tx: x + dx, ty: y + dy, dx, dy })
    }
  }

  // Posição do pin no grid 3x3 (tile central = posição 256,256)
  const { px, py } = latLngToPixelOffset(latitude, longitude, zoom, x, y)
  const pinX = 256 + px  // offset dentro do tile central
  const pinY = 256 + py

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Mapa com tiles OSM */}
      <div
        className="relative bg-gray-100 overflow-hidden"
        style={{ height: 220 }}
      >
        {/* Grid de tiles 3x3 = 768x768, centralizado */}
        <div
          style={{
            position: 'absolute',
            width: 768,
            height: 768,
            top: '50%',
            left: '50%',
            transform: `translate(calc(-${pinX}px - 50%), calc(-${pinY}px - 50%))`,
          }}
        >
          {tiles.map(({ tx, ty, dx, dy }) => (
            <img
              key={`${dx},${dy}`}
              src={`https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`}
              alt=""
              width={256}
              height={256}
              style={{
                position: 'absolute',
                left: (dx + 1) * 256,
                top: (dy + 1) * 256,
                imageRendering: 'auto',
              }}
            />
          ))}
        </div>

        {/* Pin fixo no centro */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            fontSize: 32,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          📍
        </div>

        {/* Atribuição OSM */}
        <div className="absolute bottom-1 right-1 bg-white/80 text-gray-500 text-[10px] px-1 rounded z-10">
          © OpenStreetMap
        </div>
      </div>

      {/* Endereço + botões */}
      <div className="bg-white px-4 py-3 border-t border-gray-100">
        {(nomeFazenda || endereco) && (
          <p className="text-sm text-gray-600 mb-3">
            {nomeFazenda && <span className="font-medium text-gray-800">🌾 {nomeFazenda} · </span>}
            {endereco}
          </p>
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
            className="flex items-center justify-center px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            🚗 Waze
          </a>
        </div>
      </div>
    </div>
  )
}
