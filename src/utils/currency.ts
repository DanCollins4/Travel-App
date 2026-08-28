const CACHE_PREFIX = 'fx-rates-v1-'

export interface RatesResult {
  base: string
  date: string
  rates: Record<string, number>
}

/**
 * Fetches latest exchange rates for `base` via exchangerate-api.com's free,
 * keyless endpoint. Cached in localStorage per base+day since rates only
 * update once daily and we don't want to hit the API on every render.
 */
export async function getRates(base: string): Promise<RatesResult | null> {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `${CACHE_PREFIX}${base}-${today}`

  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    // ignore, fall through to fetch
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.result !== 'success') return null
    const result: RatesResult = { base, date: data.time_last_update_utc ?? today, rates: data.rates }
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result))
    } catch {
      // storage full/unavailable — still return the fetched rates
    }
    return result
  } catch {
    return null
  }
}

export const TRAVEL_CURRENCIES = [
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
]
