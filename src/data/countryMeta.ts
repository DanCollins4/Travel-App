import type { CountryCode } from '../types'

export const COUNTRIES: { code: CountryCode; name: string; flag: string; color: string }[] = [
  { code: 'australia', name: 'Australia', flag: '🇦🇺', color: '#fb923c' },
  { code: 'cambodia', name: 'Cambodia', flag: '🇰🇭', color: '#06b6d4' },
  { code: 'china', name: 'China', flag: '🇨🇳', color: '#ef4444' },
  { code: 'hongkong', name: 'Hong Kong', flag: '🇭🇰', color: '#ec4899' },
  { code: 'laos', name: 'Laos', flag: '🇱🇦', color: '#84cc16' },
  { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾', color: '#a855f7' },
  { code: 'thailand', name: 'Thailand', flag: '🇹🇭', color: '#f59e0b' },
  { code: 'vietnam', name: 'Vietnam', flag: '🇻🇳', color: '#3b82f6' },
  { code: 'other', name: 'Other', flag: '🌍', color: '#64748b' },
]

export function countryMeta(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1]
}

/** ISO 3166-1 alpha-2 codes, used to restrict geocoding to the right country. */
const COUNTRY_ISO2: Partial<Record<CountryCode, string>> = {
  australia: 'au',
  cambodia: 'kh',
  china: 'cn',
  hongkong: 'hk',
  laos: 'la',
  malaysia: 'my',
  thailand: 'th',
  vietnam: 'vn',
}

export function countryIso2(code: CountryCode): string | undefined {
  return COUNTRY_ISO2[code]
}
