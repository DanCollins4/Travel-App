import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, BookedType, CountryCode } from '../types'
import { COUNTRIES, countryMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Pill, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'
import { format, parseISO } from 'date-fns'
import { geocodePlace } from '../utils/geocode'

const TRANSPORT_TYPES: BookedType[] = ['flight', 'train', 'bus', 'ferry']

const TYPE_ICON: Record<BookedType, string> = {
  flight: '✈️',
  train: '🚆',
  bus: '🚌',
  ferry: '⛴️',
  accommodation: '🏨',
  tour: '🧭',
  other: '📌',
}

type FormState = Omit<BookedItem, 'id' | 'createdAt'>

const emptyForm: FormState = {
  type: 'flight',
  title: '',
  country: 'thailand',
  from: '',
  to: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  confirmationNumber: '',
  cost: undefined,
  currency: 'GBP',
  link: '',
  notes: '',
}

export default function BookedTab() {
  const { items, loading, add, update, remove } = useCollection<BookedItem>('booked')
  const [editing, setEditing] = useState<BookedItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  const sorted = useMemo(() => [...items].sort((a, b) => a.startDate.localeCompare(b.startDate)), [items])

  const totalCost = useMemo(
    () => items.reduce((sum, i) => sum + (i.cost ?? 0), 0),
    [items],
  )

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }
  function openEdit(item: BookedItem) {
    setEditing(item)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Booked</h1>
          <p className="text-sm text-slate-400">
            Confirmed flights, transport, accommodation and tours, in order.
            {items.length > 0 && <span className="text-slate-300"> Total booked: £{totalCost.toLocaleString()}</span>}
          </p>
        </div>
        <Button onClick={openNew}>+ Add booking</Button>
      </div>

      {!loading && sorted.length === 0 && (
        <EmptyState icon="🎫" title="Nothing booked yet" subtitle="Add flights, buses, hostels and tours as you confirm them." />
      )}

      <div className="space-y-3">
        {sorted.map((item) => {
          const meta = countryMeta(item.country)
          return (
            <Card key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-2xl">{TYPE_ICON[item.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-100">{item.title}</h3>
                  <Pill color={meta.color}>
                    {meta.flag} {meta.name}
                  </Pill>
                </div>
                <p className="text-sm text-slate-400">
                  {item.from && item.to ? `${item.from} → ${item.to} · ` : ''}
                  {format(parseISO(item.startDate), 'd MMM yyyy')}
                  {item.endDate ? ` – ${format(parseISO(item.endDate), 'd MMM yyyy')}` : ''}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                  {item.confirmationNumber && <span>Ref: {item.confirmationNumber}</span>}
                  {item.cost !== undefined && (
                    <span>
                      {item.currency ?? ''} {item.cost.toLocaleString()}
                    </span>
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      Booking link
                    </a>
                  )}
                </div>
                {item.notes && <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">{item.notes}</p>}
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button variant="secondary" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(item.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <BookedForm
          initial={editing ?? emptyForm}
          onCancel={() => setShowForm(false)}
          onSave={async (data) => {
            // Save immediately — geocoding happens in the background afterward so the
            // form doesn't sit waiting on a network round-trip (and Nominatim's rate limit).
            let id: string | undefined
            if (editing) {
              id = editing.id
              await update(id, data)
            } else {
              id = await add(data)
            }
            setShowForm(false)
            if (!id) return

            const countryName = data.country === 'other' ? '' : `, ${countryMeta(data.country).name}`
            if (TRANSPORT_TYPES.includes(data.type)) {
              if (data.from) {
                geocodePlace(`${data.from}${countryName}`).then((loc) => loc && update(id, { fromLocation: loc }))
              }
              if (data.to) {
                geocodePlace(`${data.to}${countryName}`).then((loc) => loc && update(id, { toLocation: loc }))
              }
            } else {
              const query = data.to || data.title
              geocodePlace(`${query}${countryName}`).then((loc) => loc && update(id, { location: loc }))
            }
          }}
        />
      )}
    </div>
  )
}

function BookedForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: FormState
  onSave: (data: FormState) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={initial.title ? 'Edit booking' : 'New booking'} onClose={onCancel}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          // Clear whichever location shape doesn't apply to the current type — the
          // background geocode (triggered by the parent after save) fills in the rest.
          const data: FormState = TRANSPORT_TYPES.includes(form.type)
            ? { ...form, location: undefined }
            : { ...form, fromLocation: undefined, toLocation: undefined }
          await onSave(data)
          setSaving(false)
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as BookedType })}>
              <option value="flight">✈️ Flight</option>
              <option value="train">🚆 Train</option>
              <option value="bus">🚌 Bus</option>
              <option value="ferry">⛴️ Ferry</option>
              <option value="accommodation">🏨 Accommodation</option>
              <option value="tour">🧭 Tour / activity</option>
              <option value="other">📌 Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as CountryCode })}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Bangkok → Chiang Mai overnight train"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              placeholder="e.g. Bangkok"
            />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              placeholder="e.g. Chiang Mai"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 -mt-1">
          {TRANSPORT_TYPES.includes(form.type)
            ? "📍 From/To place names are used to plot this leg on the map automatically — real place names work best."
            : '📍 "To" (or the title, if left blank) is used to place this on the map automatically.'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="confirmationNumber">Confirmation #</Label>
            <Input
              id="confirmationNumber"
              value={form.confirmationNumber}
              onChange={(e) => setForm({ ...form, confirmationNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            min={0}
            value={form.cost ?? ''}
            onChange={(e) => setForm({ ...form, cost: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <Label htmlFor="link">Booking link</Label>
          <Input id="link" type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save booking'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
