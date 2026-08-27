export type CountryCode = 'china' | 'thailand' | 'laos' | 'cambodia' | 'vietnam' | 'malaysia' | 'other'

export interface LatLng {
  lat: number
  lng: number
}

export interface Idea {
  id: string
  title: string
  country: CountryCode
  notes?: string
  link?: string
  priority: 'low' | 'medium' | 'high'
  estCost?: number
  location?: LatLng
  createdAt: number
}

export type BookedType = 'flight' | 'train' | 'bus' | 'ferry' | 'accommodation' | 'tour' | 'other'

export interface BookedItem {
  id: string
  type: BookedType
  title: string
  country: CountryCode
  from?: string
  to?: string
  startDate: string // ISO date (yyyy-mm-dd)
  endDate?: string // ISO date, for accommodation / multi-day
  confirmationNumber?: string
  cost?: number
  currency?: string
  link?: string
  notes?: string
  location?: LatLng
  createdAt: number
}

export interface PackingItem {
  id: string
  label: string
  category: string
  packed: boolean
  createdAt: number
}

export type BudgetCategory =
  | 'flights'
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'activities'
  | 'visas'
  | 'insurance'
  | 'gear'
  | 'other'

export interface BudgetEntry {
  id: string
  label: string
  category: BudgetCategory
  country: CountryCode
  amount: number
  currency: string
  planned: boolean // true = estimate, false = actually spent/booked
  createdAt: number
}

export interface DocumentItem {
  id: string
  label: string
  category: 'passport' | 'visa' | 'insurance' | 'vaccination' | 'booking' | 'other'
  notes?: string
  link?: string
  done: boolean
  createdAt: number
}
