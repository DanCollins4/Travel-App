import type { DocumentItem } from '../types'

export const DOCUMENTS_PRESET: { label: string; category: DocumentItem['category']; notes?: string }[] = [
  { label: 'Passport valid for 6+ months past your return date', category: 'passport' },
  { label: 'Photocopy/photo of passport stored separately from the original', category: 'passport' },
  { label: 'China visa / visa-free entry checked', category: 'visa' },
  { label: 'Thailand entry requirements checked', category: 'visa' },
  { label: 'Laos visa on arrival requirements checked', category: 'visa' },
  { label: 'Cambodia e-visa applied for', category: 'visa' },
  { label: 'Vietnam e-visa / entry requirements checked', category: 'visa' },
  { label: 'Malaysia entry requirements checked', category: 'visa' },
  { label: 'Travel insurance policy purchased (covers all activities planned)', category: 'insurance' },
  { label: 'GHIC/EHIC or equivalent (if applicable)', category: 'insurance' },
  { label: 'GP / travel clinic appointment booked (4-6 weeks before departure)', category: 'vaccination' },
  { label: 'Malaria tablets prescription sorted (if needed)', category: 'vaccination' },
  { label: 'Emergency contacts shared with family/friends', category: 'other' },
  { label: 'Bank told about travel dates / travel card ordered', category: 'other' },
  { label: 'Phone plan / eSIM sorted for data abroad', category: 'other' },
]
