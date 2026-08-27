import type { LatLng } from '../types'

const CACHE_KEY = 'geocode-cache-v1'
const MIN_GAP_MS = 1100 // stay under Nominatim's 1 req/sec usage policy

function readCache(): Record<string, LatLng | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCache(cache: Record<string, LatLng | null>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full/unavailable — geocoding still works, just re-fetches next time
  }
}

let queue: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = MIN_GAP_MS - (Date.now() - lastRequestAt)
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    lastRequestAt = Date.now()
    return fn()
  })
  queue = run.catch(() => undefined)
  return run
}

/**
 * Looks up coordinates for a free-text place name using OpenStreetMap's
 * Nominatim search (no API key needed). Results are cached in localStorage
 * so the same place is never looked up twice.
 */
export async function geocodePlace(query: string): Promise<LatLng | null> {
  const q = query.trim()
  if (!q) return null

  const cache = readCache()
  if (q in cache) return cache[q]

  try {
    const result = await enqueue(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) return null
      const data = (await res.json()) as { lat: string; lon: string }[]
      if (!data.length) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } satisfies LatLng
    })
    cache[q] = result
    writeCache(cache)
    return result
  } catch {
    return null
  }
}
