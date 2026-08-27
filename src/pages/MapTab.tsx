import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { format, parseISO } from 'date-fns'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, BookedType, Idea, LatLng } from '../types'
import { countryMeta } from '../data/countryMeta'
import { EmptyState } from '../components/ui'

const TRANSPORT_TYPES: BookedType[] = ['flight', 'train', 'bus', 'ferry']

const TRANSPORT_COLOR: Record<string, string> = {
  flight: '#38bdf8', // sky blue
  train: '#a855f7', // violet
  bus: '#f97316', // orange
  ferry: '#06b6d4', // cyan
}

const TRANSPORT_ICON: Record<string, string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
}

const BOOKED_PIN_COLOR = '#22c55e' // green — "you're confirmed to go here"
const PRIORITY_COLOR: Record<Idea['priority'], string> = {
  high: '#ef4444', // red
  medium: '#f59e0b', // amber
  low: '#94a3b8', // slate
}
const IDEA_ROUTE_COLOR = '#eab308' // amber-yellow dashed line through idea pins

interface PlaceMarker {
  key: string
  name: string
  loc: LatLng
  bookings: BookedItem[]
}

function pinIcon(color: string, glyph: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
        background:${color};
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 1px 4px rgba(0,0,0,.5);
        border:2px solid rgba(255,255,255,.9);
      ">
        <span style="transform:rotate(45deg);font-size:13px;line-height:1;">${glyph}</span>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  })
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useMemo(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 6)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length])
  return null
}

export default function MapTab() {
  const { items: booked, loading: loadingBooked } = useCollection<BookedItem>('booked')
  const { items: ideas, loading: loadingIdeas } = useCollection<Idea>('ideas')

  const bookedPlaces = useMemo(() => {
    const map = new Map<string, PlaceMarker>()
    const addPlace = (name: string | undefined, loc: LatLng | undefined, booking: BookedItem) => {
      if (!name?.trim() || !loc) return
      const key = name.trim().toLowerCase()
      const entry = map.get(key) ?? { key, name: name.trim(), loc, bookings: [] }
      entry.bookings.push(booking)
      map.set(key, entry)
    }
    for (const b of booked) {
      if (TRANSPORT_TYPES.includes(b.type)) {
        addPlace(b.from, b.fromLocation, b)
        addPlace(b.to, b.toLocation, b)
      } else {
        addPlace(b.to || b.title, b.location, b)
      }
    }
    return [...map.values()]
  }, [booked])

  const transportLegs = useMemo(
    () => booked.filter((b) => TRANSPORT_TYPES.includes(b.type) && b.fromLocation && b.toLocation),
    [booked],
  )

  const ideaPoints = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return ideas
      .filter((i) => i.location)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.createdAt - b.createdAt)
  }, [ideas])
  const ideaRoute = useMemo<[number, number][]>(
    () => ideaPoints.map((i) => [i.location!.lat, i.location!.lng]),
    [ideaPoints],
  )

  const allPoints = useMemo<[number, number][]>(
    () => [
      ...bookedPlaces.map((p) => [p.loc.lat, p.loc.lng] as [number, number]),
      ...ideaPoints.map((i) => [i.location!.lat, i.location!.lng] as [number, number]),
    ],
    [bookedPlaces, ideaPoints],
  )

  const loading = loadingBooked || loadingIdeas
  const hasAny = bookedPlaces.length > 0 || ideaPoints.length > 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Route map</h1>
        <p className="text-sm text-slate-400">
          Booked flights/trains/buses/ferries are plotted automatically as coloured routes, place names are
          located for you — no coordinates needed. Just fill in real place names on Ideas and Booked items.
        </p>
      </div>

      {!loading && !hasAny ? (
        <EmptyState
          icon="🗺️"
          title="No locations plotted yet"
          subtitle="Add an Idea or a Booking with a real place name and it'll show up here automatically."
        />
      ) : (
        <div className="h-[65vh] rounded-2xl overflow-hidden border border-slate-800">
          <MapContainer center={[15, 105]} zoom={5} className="w-full h-full">
            <TileLayer
              // CartoDB Voyager: free, no API key, renders place names in English/Latin script worldwide.
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
            <FitBounds points={allPoints} />

            {/* Solid, mode-coloured lines for each booked transport leg */}
            {transportLegs.map((leg) => (
              <Polyline
                key={leg.id}
                positions={[
                  [leg.fromLocation!.lat, leg.fromLocation!.lng],
                  [leg.toLocation!.lat, leg.toLocation!.lng],
                ]}
                pathOptions={{ color: TRANSPORT_COLOR[leg.type], weight: 4, opacity: 0.85 }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">
                      {TRANSPORT_ICON[leg.type]} {leg.title}
                    </p>
                    <p className="text-slate-500">
                      {leg.from} → {leg.to}
                    </p>
                    <p className="text-slate-500">{format(parseISO(leg.startDate), 'd MMM yyyy')}</p>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Dashed line loosely connecting idea pins, ordered by priority */}
            {ideaRoute.length > 1 && (
              <Polyline positions={ideaRoute} pathOptions={{ color: IDEA_ROUTE_COLOR, weight: 2.5, dashArray: '4 8', opacity: 0.8 }} />
            )}

            {bookedPlaces.map((place) => (
              <Marker key={place.key} position={[place.loc.lat, place.loc.lng]} icon={pinIcon(BOOKED_PIN_COLOR, '✓')}>
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{place.name}</p>
                    {place.bookings.map((b) => (
                      <p key={b.id} className="text-slate-500">
                        {TRANSPORT_TYPES.includes(b.type) ? TRANSPORT_ICON[b.type] : '📌'} {b.title} ·{' '}
                        {format(parseISO(b.startDate), 'd MMM yyyy')}
                      </p>
                    ))}
                  </div>
                </Popup>
              </Marker>
            ))}

            {ideaPoints.map((idea) => {
              const meta = countryMeta(idea.country)
              return (
                <Marker
                  key={idea.id}
                  position={[idea.location!.lat, idea.location!.lng]}
                  icon={pinIcon(PRIORITY_COLOR[idea.priority], '💡')}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{idea.title}</p>
                      <p className="text-slate-500">
                        {meta.flag} {meta.name} · {idea.priority} priority idea, not booked yet
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: BOOKED_PIN_COLOR }} /> Booked place
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLOR.high }} /> High priority idea
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLOR.medium }} /> Medium priority idea
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLOR.low }} /> Low priority idea
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: TRANSPORT_COLOR.flight }} /> Flight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: TRANSPORT_COLOR.train }} /> Train
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: TRANSPORT_COLOR.bus }} /> Bus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: TRANSPORT_COLOR.ferry }} /> Ferry
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-0.5"
            style={{ backgroundImage: `linear-gradient(90deg, ${IDEA_ROUTE_COLOR} 60%, transparent 40%)`, backgroundSize: '6px 2px' }}
          />{' '}
          Idea route (not booked)
        </span>
      </div>
    </div>
  )
}
