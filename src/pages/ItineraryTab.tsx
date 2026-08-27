import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, Idea } from '../types'
import { countryMeta } from '../data/countryMeta'
import { Card, EmptyState, Pill } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'

const TYPE_ICON: Record<BookedItem['type'], string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
  accommodation: '🏨',
  tour: '🧭',
  other: '📌',
}

export default function ItineraryTab() {
  const { user } = useAuth()
  const { items: booked, loading: loadingBooked } = useCollection<BookedItem>('booked')
  const { items: ideas } = useCollection<Idea>('ideas')

  const sorted = useMemo(() => [...booked].sort((a, b) => a.startDate.localeCompare(b.startDate)), [booked])
  const upcoming = sorted.filter((b) => b.startDate >= new Date().toISOString().slice(0, 10))
  const nextTrip = upcoming[0] ?? sorted[0]

  const countriesCovered = useMemo(() => {
    const set = new Set([...booked.map((b) => b.country), ...ideas.map((i) => i.country)])
    set.delete('other')
    return set.size
  }, [booked, ideas])

  const totalSpent = useMemo(() => booked.reduce((sum, b) => sum + (b.cost ?? 0), 0), [booked])

  const grouped = useMemo(() => {
    const map = new Map<string, BookedItem[]>()
    for (const item of sorted) {
      const key = format(parseISO(item.startDate), 'MMMM yyyy')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return [...map.entries()]
  }, [sorted])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-slate-400">Here's the shape of your gap year so far.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={nextTrip ? (upcoming[0] ? 'Days to go' : 'Trip started') : 'Days to go'}
          value={nextTrip ? String(Math.max(0, differenceInCalendarDays(parseISO(nextTrip.startDate), new Date()))) : '—'}
        />
        <StatCard label="Countries" value={String(countriesCovered)} />
        <StatCard label="Booked items" value={String(booked.length)} />
        <StatCard label="Total spent" value={`£${totalSpent.toLocaleString()}`} />
      </div>

      {nextTrip && (
        <Card className="bg-sky-500/10 border-sky-500/30">
          <p className="text-xs uppercase tracking-wide text-sky-300 font-medium mb-1">
            {upcoming[0] ? 'Next up' : 'First booking'}
          </p>
          <p className="text-lg font-medium">
            {TYPE_ICON[nextTrip.type]} {nextTrip.title}
          </p>
          <p className="text-sm text-slate-400">{format(parseISO(nextTrip.startDate), 'EEEE d MMMM yyyy')}</p>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium text-slate-200">Timeline</h2>
          <Link to="/booked" className="text-xs text-sky-400 hover:underline">
            Manage bookings →
          </Link>
        </div>

        {!loadingBooked && sorted.length === 0 && (
          <EmptyState icon="🗓️" title="Your timeline is empty" subtitle="Book something — flights, buses or hostels — and it'll show up here in order." />
        )}

        <div className="space-y-6">
          {grouped.map(([month, monthItems]) => (
            <div key={month}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{month}</h3>
              <div className="space-y-2">
                {monthItems.map((item) => {
                  const meta = countryMeta(item.country)
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5">
                      <span className="text-lg">{TYPE_ICON[item.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          {format(parseISO(item.startDate), 'EEE d MMM')}
                          {item.from && item.to ? ` · ${item.from} → ${item.to}` : ''}
                        </p>
                      </div>
                      <Pill color={meta.color}>{meta.flag}</Pill>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {ideas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium text-slate-200">Still deciding</h2>
            <Link to="/ideas" className="text-xs text-sky-400 hover:underline">
              See all ideas →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {ideas.slice(0, 8).map((idea) => {
              const meta = countryMeta(idea.country)
              return (
                <Pill key={idea.id} color={meta.color}>
                  {meta.flag} {idea.title}
                </Pill>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center py-3">
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </Card>
  )
}
