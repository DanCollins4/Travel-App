import { useState } from 'react'
import { COUNTRY_GUIDES } from '../data/recommendations'
import { Card, Pill } from '../components/ui'

export default function RecommendationsTab() {
  const [active, setActive] = useState(COUNTRY_GUIDES[0].code)
  const guide = COUNTRY_GUIDES.find((g) => g.code === active)!

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Recommendations</h1>
        <p className="text-sm text-slate-400">
          Quick-reference guides for your six countries: highlights, health, currency, weather and plugs.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {COUNTRY_GUIDES.map((g) => (
          <button
            key={g.code}
            onClick={() => setActive(g.code)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm border ${
              active === g.code ? 'bg-slate-100 text-slate-900 border-slate-100 font-medium' : 'border-slate-700 text-slate-400'
            }`}
          >
            {g.flag} {g.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="space-y-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {guide.flag} {guide.name}
          </h2>
          <p className="text-sm text-slate-400">Capital: {guide.capital}</p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">💱 Currency</h3>
            <p className="text-sm text-slate-300">{guide.currency}</p>
            {guide.currencyNote && <p className="text-xs text-slate-500 mt-1">{guide.currencyNote}</p>}
          </Card>
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">🔌 Plug sockets</h3>
            <p className="text-sm text-slate-300">
              Type {guide.plug.types} · {guide.plug.voltage}
            </p>
            {guide.plug.note && <p className="text-xs text-slate-500 mt-1">{guide.plug.note}</p>}
          </Card>
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">🗣️ Language</h3>
            <p className="text-sm text-slate-300">{guide.language}</p>
          </Card>
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">🛂 Visa</h3>
            <p className="text-sm text-slate-300">{guide.visa}</p>
          </Card>
        </div>

        <Card>
          <h3 className="font-medium text-slate-200 mb-2">☀️ Weather &amp; best time to visit</h3>
          <p className="text-sm text-sky-300 mb-2">Best time: {guide.bestTime}</p>
          <div className="space-y-2">
            {guide.weather.map((w) => (
              <div key={w.season} className="text-sm">
                <span className="text-slate-200 font-medium">{w.season}: </span>
                <span className="text-slate-400">{w.detail}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-medium text-slate-200 mb-2">💉 Vaccinations &amp; health</h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {guide.vaccinations.map((v) => (
              <Pill key={v} color="#4ade80">
                {v}
              </Pill>
            ))}
          </div>
          <p className="text-sm text-slate-400">{guide.healthNotes}</p>
          <p className="text-xs text-slate-500 mt-2 border-t border-slate-800 pt-2">
            Not medical advice — recommendations depend on your itinerary, activities and vaccination history.
            Check with your GP or a travel clinic (e.g. NHS Travel Health Pro in the UK) 4–6 weeks before you leave.
          </p>
        </Card>

        <Card>
          <h3 className="font-medium text-slate-200 mb-3">📍 Places to visit</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.placesToVisit.map((p) => (
              <div key={p.name}>
                <p className="text-sm font-medium text-slate-200">{p.name}</p>
                <p className="text-sm text-slate-400">{p.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">🚌 Getting around</h3>
            <p className="text-sm text-slate-400">{guide.gettingAround}</p>
          </Card>
          <Card>
            <h3 className="font-medium text-slate-200 mb-2">💵 Money tips</h3>
            <p className="text-sm text-slate-400">{guide.moneyTips}</p>
          </Card>
        </div>

        <Card>
          <h3 className="font-medium text-slate-200 mb-2">🛡️ Safety tips</h3>
          <p className="text-sm text-slate-400">{guide.safetyTips}</p>
        </Card>
      </div>
    </div>
  )
}
