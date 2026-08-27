import type { CountryCode } from '../types'

export const COUNTRIES: { code: CountryCode; name: string; flag: string; color: string }[] = [
  { code: 'china', name: 'China', flag: '🇨🇳', color: '#ef4444' },
  { code: 'thailand', name: 'Thailand', flag: '🇹🇭', color: '#f59e0b' },
  { code: 'laos', name: 'Laos', flag: '🇱🇦', color: '#84cc16' },
  { code: 'cambodia', name: 'Cambodia', flag: '🇰🇭', color: '#06b6d4' },
  { code: 'vietnam', name: 'Vietnam', flag: '🇻🇳', color: '#3b82f6' },
  { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾', color: '#a855f7' },
  { code: 'other', name: 'Other', flag: '🌍', color: '#64748b' },
]

export function countryMeta(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1]
}
