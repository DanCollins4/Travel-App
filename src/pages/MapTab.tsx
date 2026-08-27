import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, Idea } from '../types'
import { countryMeta } from '../data/countryMeta'
import { EmptyState } from '../components/ui'
import { format, parseISO } from 'date-fns'

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

  const routeStops = useMemo(
    () =>
      booked
        .filter((b) => b.location)
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [booked],
  )
  const routeLine = useMemo<[number, number][]>(
    () => routeStops.map((s) => [s.location!.lat, s.location!.lng]),
    [routeStops],
  )
  const ideaPoints = useMemo(() => ideas.filter((i) => i.location), [ideas])

  const allPoints = useMemo<[number, number][]>(
    () => [...routeLine, ...ideaPoints.map((i) => [i.location!.lat, i.location!.lng] as [number, number])],
    [routeLine, ideaPoints],
  )

  const loading = loadingBooked || loadingIdeas
  const hasAny = routeStops.length > 0 || ideaPoints.length > 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Route map</h1>
        <p className="text-sm text-slate-400">
          Booked stops (in date order) connected as your route, plus idea pins you haven't booked yet. Add
          coordinates to an Idea or Booking to see it here.
        </p>
      </div>

      {!loading && !hasAny ? (
        <EmptyState
          icon="🗺️"
          title="No locations plotted yet"
          subtitle="Open an Idea or Booking and add latitude/longitude to plot it on the map."
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
            {routeLine.length > 1 && (
              <Polyline positions={routeLine} pathOptions={{ color: '#38bdf8', weight: 3, dashArray: '6 6' }} />
            )}
            {routeStops.map((stop, idx) => {
              const meta = countryMeta(stop.country)
              return (
                <Marker
                  key={stop.id}
                  position={[stop.location!.lat, stop.location!.lng]}
                  icon={pinIcon(meta.color, String(idx + 1))}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{stop.title}</p>
                      <p className="text-slate-500">
                        {meta.flag} {meta.name} · {format(parseISO(stop.startDate), 'd MMM yyyy')}
                      </p>
                      {stop.from && stop.to && (
                        <p className="text-slate-500">
                          {stop.from} → {stop.to}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
            {ideaPoints.map((idea) => {
              const meta = countryMeta(idea.country)
              return (
                <Marker
                  key={idea.id}
                  position={[idea.location!.lat, idea.location!.lng]}
                  icon={pinIcon('#facc15', '💡')}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{idea.title}</p>
                      <p className="text-slate-500">
                        {meta.flag} {meta.name} · idea, not booked yet
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-sky-400" /> Booked stop (numbered by date)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> 💡 Idea, not booked
        </span>
      </div>
    </div>
  )
}
