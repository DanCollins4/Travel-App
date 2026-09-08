import type { DocumentCountry, DocumentItem } from '../types'

export const DOCUMENTS_PRESET: { label: string; category: DocumentItem['category']; country: DocumentCountry; notes?: string }[] = [
  { label: 'Passport valid for 6+ months past your return date', category: 'passport', country: 'trip' },
  { label: 'Photocopy/photo of passport stored separately from the original', category: 'passport', country: 'trip' },
  { label: 'Australia eVisitor/ETA visa applied for', category: 'visa', country: 'australia' },
  { label: 'Cambodia e-visa applied for', category: 'visa', country: 'cambodia' },
  { label: 'China visa / visa-free entry checked', category: 'visa', country: 'china' },
  { label: 'Hong Kong entry requirements checked', category: 'visa', country: 'hongkong' },
  { label: 'Laos visa on arrival requirements checked', category: 'visa', country: 'laos' },
  { label: 'Malaysia entry requirements checked', category: 'visa', country: 'malaysia' },
  { label: 'Thailand entry requirements checked', category: 'visa', country: 'thailand' },
  { label: 'Vietnam e-visa / entry requirements checked', category: 'visa', country: 'vietnam' },
  { label: 'Travel insurance policy purchased (covers all activities planned)', category: 'insurance', country: 'trip' },
  { label: 'GHIC/EHIC or equivalent (if applicable)', category: 'insurance', country: 'trip' },
  { label: 'GP / travel clinic appointment booked (4-6 weeks before departure)', category: 'vaccination', country: 'trip' },
  { label: 'Malaria tablets prescription sorted (if needed)', category: 'vaccination', country: 'trip' },
  { label: 'Emergency contacts shared with family/friends', category: 'other', country: 'trip' },
  { label: 'Bank told about travel dates / travel card ordered', category: 'other', country: 'trip' },
  { label: 'Phone plan / eSIM sorted for data abroad', category: 'other', country: 'trip' },
]
