export interface ClimatePreset {
  id: string
  label: string
  items: { label: string; category: string }[]
}

export const CLIMATE_PRESETS: ClimatePreset[] = [
  {
    id: 'tropical',
    label: '🏖️ Tropical / beach',
    items: [
      { label: 'Swimwear', category: 'Clothing' },
      { label: 'Reef-safe sunscreen (high SPF)', category: 'Health' },
      { label: 'Lightweight, quick-dry clothing', category: 'Clothing' },
      { label: 'Sandals/flip-flops', category: 'Clothing' },
      { label: 'Wide-brim hat or cap', category: 'Clothing' },
      { label: 'Dry bag', category: 'Gear' },
      { label: 'Mosquito repellent', category: 'Health' },
      { label: 'Light rain jacket', category: 'Clothing' },
      { label: 'Snorkel gear (optional)', category: 'Gear' },
    ],
  },
  {
    id: 'cold-mountain',
    label: '🏔️ Cold / mountain trekking',
    items: [
      { label: 'Thermal base layers', category: 'Clothing' },
      { label: 'Warm fleece or down jacket', category: 'Clothing' },
      { label: 'Waterproof outer shell', category: 'Clothing' },
      { label: 'Gloves and beanie', category: 'Clothing' },
      { label: 'Wool hiking socks', category: 'Clothing' },
      { label: 'Sturdy trekking boots', category: 'Clothing' },
      { label: 'Hand warmers', category: 'Gear' },
      { label: 'Head torch', category: 'Gear' },
    ],
  },
  {
    id: 'jungle-trekking',
    label: '🌴 Jungle / trekking',
    items: [
      { label: 'Insect repellent (high DEET)', category: 'Health' },
      { label: 'Long sleeves & trousers (bugs/scratches)', category: 'Clothing' },
      { label: 'Waterproof daypack cover or dry bag', category: 'Gear' },
      { label: 'Head torch', category: 'Gear' },
      { label: 'Blister plasters', category: 'Health' },
      { label: 'Broken-in hiking boots', category: 'Clothing' },
      { label: 'Water purification tablets/filter bottle', category: 'Gear' },
    ],
  },
  {
    id: 'city',
    label: '🏙️ City / urban',
    items: [
      { label: 'Smart-casual outfit (for nice dinners)', category: 'Clothing' },
      { label: 'Comfortable walking shoes', category: 'Clothing' },
      { label: 'Small day bag', category: 'Gear' },
      { label: 'Portable charger', category: 'Tech' },
      { label: 'Laundry bag', category: 'Gear' },
    ],
  },
]

export function climatePreset(id: string) {
  return CLIMATE_PRESETS.find((c) => c.id === id)
}
