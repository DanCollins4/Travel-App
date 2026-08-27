import type { CountryCode } from '../types'

export interface PlugInfo {
  types: string
  voltage: string
  note?: string
}

export interface CountryGuide {
  code: Exclude<CountryCode, 'other'>
  name: string
  flag: string
  capital: string
  currency: string
  currencyNote?: string
  language: string
  plug: PlugInfo
  bestTime: string
  weather: { season: string; detail: string }[]
  vaccinations: string[]
  healthNotes: string
  visa: string
  placesToVisit: { name: string; detail: string }[]
  gettingAround: string
  moneyTips: string
  safetyTips: string
}

export const COUNTRY_GUIDES: CountryGuide[] = [
  {
    code: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    capital: 'Canberra',
    currency: 'Australian Dollar (AUD, $)',
    language: 'English (official) — no language barrier.',
    plug: { types: 'I (unique Australian three-pin)', voltage: '230V, 50Hz', note: "Different from the UK's Type G — bring a proper adaptor, not just a generic European one." },
    bestTime: 'Spring (Sep–Nov) and Autumn (Mar–May) for the south/east; May–Oct (dry season) for the tropical north.',
    weather: [
      { season: 'South & east coast (Sydney, Melbourne)', detail: 'Four proper seasons, opposite to the UK — summer (Dec–Feb) hot, winter (Jun–Aug) cool. Spring/autumn are the most pleasant.' },
      { season: 'Tropical north (Darwin, Cairns)', detail: 'Dry season (May–Oct) is sunny and the best time to visit; wet season (Nov–Apr) brings monsoonal rain and cyclone risk.' },
      { season: 'Outback / Red Centre (Uluru)', detail: 'Extreme heat in summer (40°C+), surprisingly cold nights in winter — pack layers.' },
    ],
    vaccinations: ['Routine vaccinations up to date (MMR, DTP)', 'No special vaccinations typically required', 'No malaria risk'],
    healthNotes: 'Excellent healthcare, but not free for visitors — comprehensive travel insurance is essential given how expensive treatment can be without it.',
    visa: 'Most Western nationalities (UK, EU and others) need an eVisitor or ETA visa arranged online before travel — cheap and usually processed within days, but don\'t leave it until the airport.',
    placesToVisit: [
      { name: 'Sydney', detail: 'Opera House, Harbour Bridge climb, and Bondi to Coogee coastal walk.' },
      { name: 'Great Barrier Reef (Cairns/Port Douglas)', detail: 'World-class diving and snorkelling on the world\'s largest reef system.' },
      { name: 'Melbourne', detail: 'Laneway cafés, street art, and the gateway to the Great Ocean Road.' },
      { name: 'Uluru & the Red Centre', detail: 'Australia\'s spiritual heart — sunrise/sunset over the rock.' },
      { name: 'Whitsunday Islands', detail: 'Whitehaven Beach and sailing trips through the reef.' },
      { name: 'Byron Bay & Gold Coast', detail: 'Surf towns and backpacker-friendly beach culture.' },
      { name: 'Tasmania', detail: 'Wilderness, wildlife and a slower pace, a short flight from the mainland.' },
    ],
    gettingAround: 'It\'s a huge country — domestic flights (Jetstar, Virgin Australia) are often essential between regions. The East Coast is the classic backpacker route by Greyhound/Premier bus or campervan.',
    moneyTips: 'Tap-to-pay is accepted almost everywhere, cash is rarely needed. Budget more per day than in Southeast Asia — Australia is a comparatively expensive destination.',
    safetyTips: 'Very safe overall; the real risks are environmental — very strong UV (wear sunscreen even on cloudy days), only swim between the flagged areas due to rips, and take local advice seriously around wildlife in rural areas.',
  },
  {
    code: 'cambodia',
    name: 'Cambodia',
    flag: '🇰🇭',
    capital: 'Phnom Penh',
    currency: 'US Dollar (USD) is the de facto everyday currency; Cambodian Riel (KHR) used for small change',
    language: 'Khmer. English is common in tourist hubs like Siem Reap and Phnom Penh.',
    plug: { types: 'A, C, G', voltage: '230V, 50Hz', note: 'A useful mix — both the two-pin European style and UK-style three-pin sockets are common.' },
    bestTime: 'November to February for cooler, drier conditions.',
    weather: [
      { season: 'Cool & dry (Nov–Feb)', detail: 'The most comfortable months, roughly 22–30°C.' },
      { season: 'Hot season (Mar–Apr)', detail: 'Very hot and dry, often up to 40°C.' },
      { season: 'Wet season (May–Oct)', detail: "Daily afternoon downpours but lush scenery — Angkor Wat's moats are at their most photogenic." },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis, Rabies', 'Malaria tablets for rural/forested border areas — Siem Reap and Phnom Penh are low risk'],
    healthNotes: 'Serious medical care is limited outside Phnom Penh — insurance with evacuation cover to Bangkok is common practice among travellers.',
    visa: 'e-Visa available online in advance, or visa on arrival at major border crossings and airports — bring a passport photo and USD cash.',
    placesToVisit: [
      { name: 'Angkor Wat & Siem Reap', detail: 'The largest religious monument on Earth, plus the wider Angkor temple complex.' },
      { name: 'Phnom Penh', detail: 'Royal Palace, riverside promenade, and the sobering Khmer Rouge history at Tuol Sleng and the Killing Fields.' },
      { name: 'Battambang', detail: 'French-colonial architecture and the quirky bamboo train.' },
      { name: 'Koh Rong & Koh Rong Samloem', detail: 'White-sand islands, bioluminescent plankton at night.' },
      { name: 'Kampot & Kep', detail: 'Riverside chill, famous pepper farms and crab market.' },
    ],
    gettingAround: 'Buses and minivans connect the main towns cheaply; roads have improved a lot but can still be slow. Tuk-tuks are the standard way to get around cities and temple complexes.',
    moneyTips: 'Bring crisp, undamaged USD notes — torn or heavily worn bills are often refused. Riel is given as change for anything under $1.',
    safetyTips: 'Generally safe for travellers; take normal precautions with bags in Phnom Penh. Stick to marked paths in rural areas due to residual landmines/UXO from past conflicts.',
  },
  {
    code: 'china',
    name: 'China',
    flag: '🇨🇳',
    capital: 'Beijing',
    currency: 'Chinese Yuan / Renminbi (CNY, ¥)',
    currencyNote:
      'Cash use is low — locals pay via Alipay/WeChat Pay. Set these up with an international card before you go, and carry some cash as backup.',
    language: 'Mandarin Chinese. English is limited outside big cities and tourist sites — download an offline translator (Pleco or Google Translate offline pack) and a VPN for Google/WhatsApp access.',
    plug: { types: 'A, C, I', voltage: '220V, 50Hz', note: 'Many sockets accept both two-pin (A) and the Australian-style three-pin (I) plugs — a universal adaptor is the easiest option.' },
    bestTime: 'Spring (Mar–May) and Autumn (Sep–Nov) for mild, dry weather nationwide.',
    weather: [
      { season: 'Spring (Mar–May)', detail: 'Mild and generally dry — a great time to visit most of the country.' },
      { season: 'Summer (Jun–Aug)', detail: 'Hot and humid in the south/east (30°C+), with a wet season roughly May–Sep. North stays hot but drier.' },
      { season: 'Autumn (Sep–Nov)', detail: 'Warm days, cool nights, low rainfall — arguably the best window.' },
      { season: 'Winter (Dec–Feb)', detail: 'Very cold and dry in the north (Beijing can drop below 0°C); mild in the far south (e.g. Yunnan).' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis (rural/long stays), Rabies (if trekking or around animals)'],
    healthNotes: 'Tap water is not safe to drink — stick to bottled/boiled water. Air pollution can be significant in major cities.',
    visa: 'China has introduced visa-free entry for many nationalities (including the UK, EU, Australia) for short stays — rules and durations change, so verify the current policy for your passport before booking flights.',
    placesToVisit: [
      { name: 'Beijing', detail: 'Great Wall, Forbidden City, Temple of Heaven, hutong alleyways.' },
      { name: "Xi'an", detail: 'Terracotta Army and the ancient city walls.' },
      { name: 'Zhangjiajie', detail: 'Towering sandstone pillars that inspired Avatar — incredible hiking.' },
      { name: 'Guilin & Yangshuo', detail: 'Karst mountain scenery and a cruise down the Li River.' },
      { name: 'Chengdu', detail: 'Giant panda base and legendary Sichuan food.' },
      { name: 'Yunnan (Lijiang, Dali, Tiger Leaping Gorge)', detail: "Old towns, minority cultures and one of the world's deepest canyons." },
      { name: 'Shanghai', detail: 'Futuristic skyline along the Bund, contrasted with the old French Concession.' },
    ],
    gettingAround: 'The high-speed rail network is fast, cheap and covers most of the country — book via Trip.com. Domestic flights are useful for longer hops (e.g. into Yunnan).',
    moneyTips: 'Set up Alipay or WeChat Pay linked to a foreign card before arrival; almost nothing, including street food, runs on cash anymore.',
    safetyTips: 'Very low petty crime. Main friction points are the language barrier and needing a VPN for Google, Gmail, WhatsApp and most Western apps — install one before you land.',
  },
  {
    code: 'hongkong',
    name: 'Hong Kong',
    flag: '🇭🇰',
    capital: '— (Special Administrative Region of China; no separate capital)',
    currency: 'Hong Kong Dollar (HKD, HK$)',
    language: 'Cantonese and English (both official) — English is widely spoken, making this one of the easiest stops in the region.',
    plug: { types: 'G (UK-style three-pin)', voltage: '220V, 50Hz', note: 'Same plug and voltage as the UK — no adaptor needed if travelling from the UK.' },
    bestTime: 'October to December — warm, dry and sunny.',
    weather: [
      { season: 'Autumn (Oct–Dec)', detail: 'The best window — warm, dry, sunny and comfortable humidity.' },
      { season: 'Winter (Jan–Feb)', detail: 'Cool and mild, around 15°C, occasionally chilly.' },
      { season: 'Spring (Mar–May)', detail: 'Warm with rising humidity and mist.' },
      { season: 'Summer (Jun–Sep)', detail: 'Hot, very humid, and typhoon season — heavy rain and occasional storm signals that can disrupt travel.' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Routine vaccinations up to date — otherwise low risk, no malaria'],
    healthNotes: 'Excellent healthcare standards, on par with major Western cities.',
    visa: "Visa-free entry for most Western nationalities (the UK gets an especially generous 180 days) — confirm the current allowance for your passport as it varies.",
    placesToVisit: [
      { name: 'Victoria Peak', detail: 'The classic skyline view over Hong Kong Island and the harbour.' },
      { name: 'Star Ferry', detail: 'A cheap, iconic crossing of Victoria Harbour between Hong Kong Island and Kowloon.' },
      { name: 'Big Buddha & Ngong Ping (Lantau Island)', detail: 'Cable car ride up to the giant bronze Buddha and Po Lin Monastery.' },
      { name: 'Temple Street Night Market', detail: 'Street food, fortune tellers and bargain shopping in Kowloon.' },
      { name: 'Dragon\'s Back', detail: 'A brilliant, easy coastal ridge hike with sea views, minutes from the city.' },
      { name: 'Mong Kok', detail: 'Dense, neon-lit markets — electronics, sneakers, flowers, goldfish.' },
    ],
    gettingAround: "One of the best public transport systems in the world — get an Octopus card and it covers the MTR, buses, trams and ferries. You rarely need a taxi.",
    moneyTips: "Extremely card/Octopus-friendly — you can go almost the whole trip without touching cash.",
    safetyTips: 'Very safe, low crime, and English signage everywhere makes it one of the most relaxed stops on the route.',
  },
  {
    code: 'laos',
    name: 'Laos',
    flag: '🇱🇦',
    capital: 'Vientiane',
    currency: 'Lao Kip (LAK, ₭)',
    currencyNote: 'US dollars and Thai baht are widely accepted alongside kip — useful for bigger purchases.',
    language: 'Lao. English is limited outside the main backpacker towns (Luang Prabang, Vang Vieng, Vientiane).',
    plug: { types: 'A, B, C, E, F', voltage: '230V, 50Hz', note: 'Sockets vary a lot by building age — a universal adaptor is worth carrying.' },
    bestTime: 'November to February for cool, dry weather.',
    weather: [
      { season: 'Cool & dry (Nov–Feb)', detail: 'The best time to visit — pleasant temperatures, clear skies.' },
      { season: 'Hot season (Mar–Apr)', detail: 'Can reach 38°C, plus seasonal smoke haze from agricultural burning in parts of the north.' },
      { season: 'Wet season (May–Oct)', detail: 'Monsoon rains, lush landscapes, but some rural roads and river routes can be disrupted.' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis, Rabies', 'Malaria tablets recommended for rural and forested areas'],
    healthNotes: 'Medical facilities outside Vientiane are basic — comprehensive travel insurance with medevac cover is strongly advised, especially if trekking or riding scooters.',
    visa: 'Visa on arrival available for most nationalities at international borders/airports, typically around 30 days — bring a passport photo and USD cash for the fee.',
    placesToVisit: [
      { name: 'Luang Prabang', detail: 'UNESCO old town, saffron-robed monks, night market, and the Kuang Si waterfalls.' },
      { name: 'Vang Vieng', detail: 'Dramatic karst scenery, kayaking, caving and tubing on the Nam Song river.' },
      { name: 'Si Phan Don (4000 Islands)', detail: 'Riverside hammocks, Irrawaddy dolphins and a slow-travel finale near the Cambodian border.' },
      { name: 'Nong Khiaw & Muang Ngoi', detail: 'Dramatic river gorges, far off the main tourist trail.' },
      { name: 'Plain of Jars (Phonsavan)', detail: 'Mysterious ancient megaliths and Secret War history.' },
      { name: 'Vientiane', detail: 'A relaxed capital with Buddhist temples and French-colonial streets.' },
    ],
    gettingAround: 'Roads are slower and rougher than neighbouring countries — budget extra travel time. VIP buses and minivans link the main towns; the new Laos–China railway is a fast option between Vientiane and Luang Prabang.',
    moneyTips: 'ATMs have low withdrawal limits and charge fees — withdraw larger amounts less often, and carry some USD as backup for remote areas.',
    safetyTips: 'Laos is generally very safe and laid-back. Stick to marked paths in rural areas due to unexploded ordnance (UXO) left from the Vietnam War era.',
  },
  {
    code: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    capital: 'Kuala Lumpur',
    currency: 'Malaysian Ringgit (MYR, RM)',
    language: 'Bahasa Malaysia (official); English is widely spoken as a second language, alongside Chinese and Tamil.',
    plug: { types: 'G (UK-style three-pin)', voltage: '240V, 50Hz', note: 'Same plug and voltage as the UK — no adaptor needed if travelling from the UK.' },
    bestTime: "Year-round destination — just pick the coast that's dry when you're travelling.",
    weather: [
      { season: 'Peninsula west coast (KL, Langkawi, Penang)', detail: 'Hot and humid year-round (27–32°C); driest roughly Dec–Feb.' },
      { season: 'Peninsula east coast (Perhentian, Tioman, Redang)', detail: 'Monsoon season Nov–Feb brings heavy rain and rough seas — many island resorts close; best visited Mar–Oct.' },
      { season: 'Borneo (Sabah, Sarawak)', detail: 'Hot and humid year-round, wettest Oct–Feb.' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis, Rabies', 'Malaria risk is low and mainly limited to rural interior Borneo'],
    healthNotes: 'Healthcare standards are high, especially in KL and Penang — one of the more comfortable countries in the region if you need treatment.',
    visa: 'Visa-free entry for most Western nationalities (UK, EU, Australia, US and others) for stays up to 90 days — confirm the current allowance for your passport.',
    placesToVisit: [
      { name: 'Kuala Lumpur', detail: 'Petronas Towers, Batu Caves, and some of the best hawker food in Asia.' },
      { name: 'Penang (Georgetown)', detail: 'UNESCO street art, colonial architecture and legendary street food.' },
      { name: 'Langkawi', detail: 'Duty-free islands, cable car over the rainforest canopy, easy beach time.' },
      { name: 'Cameron Highlands', detail: 'Cool-climate tea plantations and strawberry farms.' },
      { name: 'Malaysian Borneo (Kota Kinabalu, Mount Kinabalu, Sepilok)', detail: "Orangutan rehabilitation centres, diving at Sipadan, and climbing South East Asia's highest peak." },
      { name: 'Perhentian & Tioman Islands', detail: 'Budget-friendly diving and snorkelling (east coast, seasonal).' },
      { name: 'Melaka', detail: 'Historic trading-port old town, an easy day or overnight trip from KL.' },
    ],
    gettingAround: 'Excellent and cheap — the ETS train links KL to Penang and Ipoh, long-distance buses are comfortable, and AirAsia connects the peninsula to Borneo affordably.',
    moneyTips: 'Malaysia is generally the best-value stop for card payments — contactless is widely accepted even at hawker stalls, so you can carry less cash than elsewhere on the route.',
    safetyTips: 'One of the safer and easiest countries in the region for English-speaking travellers. Standard petty-crime precautions apply in KL; take care with currents at east-coast beaches.',
  },
  {
    code: 'thailand',
    name: 'Thailand',
    flag: '🇹🇭',
    capital: 'Bangkok',
    currency: 'Thai Baht (THB, ฿)',
    language: 'Thai. English is widely understood in tourist areas, less so rurally.',
    plug: { types: 'A, B, C, O (sockets usually accept multiple types)', voltage: '220V, 50Hz' },
    bestTime: 'November to February — cool(er), dry, and the most popular window.',
    weather: [
      { season: 'Cool & dry (Nov–Feb)', detail: 'Best conditions overall, 20–32°C, low rainfall.' },
      { season: 'Hot season (Mar–Jun)', detail: 'Very hot, often 35°C+, especially April.' },
      { season: 'Monsoon (Jun–Oct)', detail: 'Heavy but often short daily downpours; the Andaman coast (Phuket/Krabi) is wettest, while the Gulf islands (Koh Samui) stay drier until later in the year.' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis, Rabies', 'Malaria tablets only needed for remote border/forest areas — not for the main tourist trail'],
    healthNotes: "Tap water isn't drinkable — use bottled or filtered water. Street food is generally safe from busy, high-turnover stalls.",
    visa: 'Visa exempt for many nationalities (UK, EU, US, Australia and others) for stays up to 60 days — confirm current allowance for your passport.',
    placesToVisit: [
      { name: 'Bangkok', detail: 'Temples, markets, rooftop bars and the best street food in the region.' },
      { name: 'Chiang Mai & Pai', detail: 'Mountain scenery, ethical elephant sanctuaries, laid-back café culture.' },
      { name: 'Ayutthaya & Sukhothai', detail: 'Ancient temple ruins, easy day trips from Bangkok.' },
      { name: 'Krabi & Railay Beach', detail: 'Limestone cliffs, rock climbing, boat-only beaches.' },
      { name: 'Koh Phi Phi', detail: 'Maya Bay and iconic island scenery.' },
      { name: 'Koh Tao / Koh Phangan / Koh Samui', detail: 'Diving, Full Moon Party, and easy island-hopping.' },
      { name: 'Khao Sok National Park', detail: 'Ancient rainforest and floating bungalows on Cheow Lan Lake.' },
    ],
    gettingAround: 'Overnight trains and VIP buses connect major cities cheaply; budget flights (AirAsia, Nok Air) save time on longer hops; ferries link the islands.',
    moneyTips: 'ATMs are everywhere but charge a foreign transaction fee (~220 THB) per withdrawal — a fee-free travel card and fewer, larger withdrawals help.',
    safetyTips: 'Very tourist-friendly. Watch for the classic scams (tuk-tuk "closed temple" detours, jet-ski damage claims, gem shops) and always agree taxi/tuk-tuk fares or insist on the meter.',
  },
  {
    code: 'vietnam',
    name: 'Vietnam',
    flag: '🇻🇳',
    capital: 'Hanoi',
    currency: 'Vietnamese Dong (VND, ₫)',
    language: 'Vietnamese. English is common in tourist and backpacker areas.',
    plug: { types: 'A, C, D, F, G', voltage: '220V, 50Hz', note: 'Socket styles vary by region and building age — a universal adaptor covers all bases.' },
    bestTime: "February to April is the best overall window, though Vietnam is long enough that it's always a good season somewhere.",
    weather: [
      { season: 'North (Hanoi, Sapa, Halong Bay)', detail: 'Cool, sometimes chilly winters (Nov–Mar, jackets needed especially in Sapa); hot, humid summers with rain Jun–Sep.' },
      { season: 'Central (Hoi An, Hue, Da Nang)', detail: 'Dry and hot Feb–Aug; wetter with occasional typhoons Sep–Jan.' },
      { season: 'South (Ho Chi Minh City, Mekong Delta)', detail: 'Tropical — dry season Dec–Apr, wet season May–Nov with short daily downpours.' },
    ],
    vaccinations: ['Hepatitis A', 'Typhoid', 'Consider: Hepatitis B, Japanese Encephalitis, Rabies', 'Malaria tablets for rural/mountainous areas — main cities and the coast are low risk'],
    healthNotes: 'Good private hospitals exist in Hanoi and Ho Chi Minh City; rural care is more limited. Air quality in Hanoi can be poor in winter.',
    visa: 'e-Visa available online for most nationalities (typically 90 days); some passports (e.g. UK) get a short visa-free allowance — check the current exemption length and e-visa rules for your nationality.',
    placesToVisit: [
      { name: 'Hanoi', detail: 'Old Quarter street food, Ho Chi Minh Mausoleum, and the famous "train street".' },
      { name: 'Halong Bay', detail: 'Limestone karsts rising from emerald water — best seen on an overnight boat.' },
      { name: 'Sapa', detail: 'Rice terrace trekking through ethnic minority villages.' },
      { name: 'Ninh Binh', detail: 'Tam Coc boat rides through karst scenery — "Halong Bay on land".' },
      { name: 'Hoi An', detail: 'Lantern-lit ancient town, tailored clothing, and nearby beaches.' },
      { name: 'Hue', detail: 'Imperial citadel and royal tombs on the Perfume River.' },
      { name: 'Ho Chi Minh City & Mekong Delta', detail: 'War Remnants Museum, buzzing markets, and boat trips through the delta.' },
      { name: 'Phu Quoc', detail: "Vietnam's laid-back island getaway." },
    ],
    gettingAround: 'The "open bus" tickets and overnight sleeper trains along Highway 1 make north–south travel easy and cheap; domestic flights are handy for skipping long stretches.',
    moneyTips: 'Prices are in the thousands/millions of dong — round to make mental maths easier, and photograph exchange rates so you can spot when the number is off by a zero.',
    safetyTips: 'Traffic (especially scooters) is the biggest real risk — take extra care crossing roads and wear a helmet if you ride one yourself. Petty theft (bag-snatching from passing motorbikes) happens in big cities, so keep bags on the building side of the pavement.',
  },
]

export function guideFor(code: CountryCode) {
  return COUNTRY_GUIDES.find((g) => g.code === code)
}
