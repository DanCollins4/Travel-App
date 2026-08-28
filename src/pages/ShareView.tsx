import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { readPublicShare } from '../utils/publicShare'
import type { PublicShare } from '../types'
import { countryMeta } from '../data/countryMeta'

const TYPE_ICON: Record<string, string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
  accommodation: '🏨',
  tour: '🧭',
  other: '📌',
}

export default function ShareView() {
  const { shareId } = useParams()
  const [share, setShare] = useState<PublicShare | null | undefined>(undefined)

  useEffect(() => {
    if (!shareId) {
      setShare(null)
      return
    }
    readPublicShare(shareId)
      .then(setShare)
      .catch(() => setShare(null))
  }, [shareId])

  if (share === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading…</div>
    )
  }

  if (share === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 px-4 text-center">
        <div>
          <p className="text-3xl mb-3">🧭</p>
          <p className="font-medium text-slate-200">This itinerary link isn't available</p>
          <p className="text-sm mt-1">It may have been unpublished, or the link is incorrect.</p>
        </div>
      </div>
    )
  }

  const sorted = [...share.stops].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const grouped = new Map<string, typeof sorted>()
  for (const stop of sorted) {
    const key = format(parseISO(stop.startDate), 'MMMM yyyy')
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(stop)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-4 py-5 text-center">
        <p className="text-lg font-semibold">
          🧭 {share.ownerName ? `${share.ownerName}'s` : 'A'} gap year itinerary
        </p>
        <p className="text-xs text-slate-500 mt-1">Shared, read-only view</p>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
        {sorted.length === 0 && <p className="text-center text-slate-500 py-16">No stops booked yet.</p>}
        {[...grouped.entries()].map(([month, stops]) => (
          <div key={month}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{month}</h3>
            <div className="space-y-2">
              {stops.map((stop, i) => {
                const meta = countryMeta(stop.country)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5"
                  >
                    <span className="text-lg">{TYPE_ICON[stop.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{stop.title}</p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(stop.startDate), 'EEE d MMM')}
                        {stop.from && stop.to ? ` · ${stop.from} → ${stop.to}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {meta.flag} {meta.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      <footer className="text-center text-xs text-slate-600 py-6">Made with Gap Year Planner</footer>
    </div>
  )
}
