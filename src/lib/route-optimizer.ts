/**
 * TSP Route Optimizer — Nearest Neighbor + 2-opt
 * Same approach as NVIDIA cuOpt for small instances (≤ 20 stops).
 * Runs in < 5ms for typical daily routes (3-10 farms).
 */

export interface Stop {
  id: string
  label: string
  tipo: string
  endereco: string | null
  lat: number
  lng: number
}

export interface RouteStop extends Stop {
  ordem: number
  distanciaKm: number
  tempoMin: number
}

export interface RouteResult {
  stops: RouteStop[]
  totalKm: number
  totalMin: number
  reducaoPercent: number
  iteracoes2opt: number
}

const VELOCIDADE_RURAL_KMH = 40

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function totalDistance(order: number[], stops: Stop[], originLat: number, originLng: number): number {
  let dist = haversine(originLat, originLng, stops[order[0]].lat, stops[order[0]].lng)
  for (let i = 0; i < order.length - 1; i++) {
    dist += haversine(stops[order[i]].lat, stops[order[i]].lng, stops[order[i + 1]].lat, stops[order[i + 1]].lng)
  }
  return dist
}

function nearestNeighbor(stops: Stop[], originLat: number, originLng: number): number[] {
  const visited = new Set<number>()
  const order: number[] = []
  let curLat = originLat
  let curLng = originLng

  while (order.length < stops.length) {
    let best = -1
    let bestDist = Infinity
    for (let i = 0; i < stops.length; i++) {
      if (visited.has(i)) continue
      const d = haversine(curLat, curLng, stops[i].lat, stops[i].lng)
      if (d < bestDist) { bestDist = d; best = i }
    }
    visited.add(best)
    order.push(best)
    curLat = stops[best].lat
    curLng = stops[best].lng
  }
  return order
}

function twoOpt(order: number[], stops: Stop[], originLat: number, originLng: number): { order: number[]; iterations: number } {
  let improved = true
  let iterations = 0
  let best = [...order]

  while (improved) {
    improved = false
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)]
        if (totalDistance(candidate, stops, originLat, originLng) < totalDistance(best, stops, originLat, originLng)) {
          best = candidate
          improved = true
          iterations++
        }
      }
    }
  }
  return { order: best, iterations }
}

export function optimizeRoute(stops: Stop[], originLat: number, originLng: number): RouteResult {
  if (stops.length === 0) {
    return { stops: [], totalKm: 0, totalMin: 0, reducaoPercent: 0, iteracoes2opt: 0 }
  }
  if (stops.length === 1) {
    const dist = haversine(originLat, originLng, stops[0].lat, stops[0].lng)
    return {
      stops: [{ ...stops[0], ordem: 1, distanciaKm: Math.round(dist * 10) / 10, tempoMin: Math.round((dist / VELOCIDADE_RURAL_KMH) * 60) }],
      totalKm: Math.round(dist * 10) / 10,
      totalMin: Math.round((dist / VELOCIDADE_RURAL_KMH) * 60),
      reducaoPercent: 0,
      iteracoes2opt: 0,
    }
  }

  const greedyOrder = nearestNeighbor(stops, originLat, originLng)
  const greedyDist = totalDistance(greedyOrder, stops, originLat, originLng)

  const { order: optimized, iterations } = twoOpt(greedyOrder, stops, originLat, originLng)
  const optimizedDist = totalDistance(optimized, stops, originLat, originLng)

  const reducao = greedyDist > 0 ? Math.round(((greedyDist - optimizedDist) / greedyDist) * 100) : 0

  let prevLat = originLat
  let prevLng = originLng
  const routeStops: RouteStop[] = optimized.map((idx, i) => {
    const stop = stops[idx]
    const dist = haversine(prevLat, prevLng, stop.lat, stop.lng)
    prevLat = stop.lat
    prevLng = stop.lng
    return {
      ...stop,
      ordem: i + 1,
      distanciaKm: Math.round(dist * 10) / 10,
      tempoMin: Math.round((dist / VELOCIDADE_RURAL_KMH) * 60),
    }
  })

  const totalKm = routeStops.reduce((s, r) => s + r.distanciaKm, 0)
  const totalMin = routeStops.reduce((s, r) => s + r.tempoMin, 0)

  return {
    stops: routeStops,
    totalKm: Math.round(totalKm * 10) / 10,
    totalMin,
    reducaoPercent: reducao,
    iteracoes2opt: iterations,
  }
}
