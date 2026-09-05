import type { LatLng } from '../types'

// Bumped from v1: cache keys now include the country restriction, and old
// entries could be wrong (e.g. an unqualified "Sydney" search matching the
// wrong place) — starting fresh avoids ever reusing a bad old result.
const CACHE_KEY = 'geocode-cache-v2'
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
 * Nominatim search (no API key needed). Pass an ISO 3166-1 alpha-2
 * `countryCode` (e.g. "au") whenever the country is known — this restricts
 * the search server-side, which is what actually prevents cross-country
 * mismatches (an unqualified "Sydney" can otherwise match the wrong place;
 * appending the country name as loose text isn't reliable enough on its own).
 * Results are cached in localStorage so the same lookup is never repeated.
 */
export async function geocodePlace(query: string, countryCode?: string): Promise<LatLng | null> {
  const q = query.trim()
  if (!q) return null

  const cacheKey = `${q}|${countryCode ?? ''}`
  const cache = readCache()
  if (cacheKey in cache) return cache[cacheKey]

  try {
    const result = await enqueue(async () => {
      const params = new URLSearchParams({ format: 'jsonv2', limit: '1', q })
      if (countryCode) params.set('countrycodes', countryCode)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return null
      const data = (await res.json()) as { lat: string; lon: string }[]
      if (!data.length) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } satisfies LatLng
    })
    cache[cacheKey] = result
    writeCache(cache)
    return result
  } catch {
    return null
  }
}
