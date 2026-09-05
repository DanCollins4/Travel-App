import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, CountryCode, Idea } from '../types'
import { COUNTRIES, countryIso2, countryMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Pill, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'
import { geocodePlace } from '../utils/geocode'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const PRIORITY_LABEL = { high: '🔥 High', medium: '⭐ Medium', low: '💭 Low' }

type FormState = Omit<Idea, 'id' | 'createdAt'>

const emptyForm: FormState = {
  title: '',
  country: 'thailand',
  notes: '',
  link: '',
  priority: 'medium',
  estCost: undefined,
}

export default function IdeasTab() {
  const { items, loading, add, update, remove } = useCollection<Idea>('ideas')
  const booked = useCollection<BookedItem>('booked')
  const [editing, setEditing] = useState<Idea | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<CountryCode | 'all'>('all')

  const filtered = useMemo(() => {
    const list = filter === 'all' ? items : items.filter((i) => i.country === filter)
    return [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }, [items, filter])

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(idea: Idea) {
    setEditing(idea)
    setShowForm(true)
  }

  async function promote(idea: Idea) {
    if (!confirm(`Move "${idea.title}" to Booked? You can fill in dates and confirmation details there.`)) return
    await booked.add({
      type: 'other',
      title: idea.title,
      country: idea.country,
      startDate: new Date().toISOString().slice(0, 10),
      cost: idea.estCost,
      link: idea.link,
      notes: idea.notes,
      location: idea.location,
    } satisfies Omit<BookedItem, 'id' | 'createdAt'>)
    await remove(idea.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ideas</h1>
          <p className="text-sm text-slate-400">Bucket-list places and things to do before you book them.</p>
        </div>
        <Button onClick={openNew}>+ Add idea</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs border ${filter === 'all' ? 'bg-slate-100 text-slate-900 border-slate-100' : 'border-slate-700 text-slate-400'}`}
        >
          All
        </button>
        {COUNTRIES.filter((c) => c.code !== 'other').map((c) => (
          <button
            key={c.code}
            onClick={() => setFilter(c.code)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs border ${filter === c.code ? 'bg-slate-100 text-slate-900 border-slate-100' : 'border-slate-700 text-slate-400'}`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState icon="💡" title="No ideas yet" subtitle="Add places you might want to visit — you can promote them to Booked later." />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((idea) => {
          const meta = countryMeta(idea.country)
          return (
            <Card key={idea.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-slate-100">{idea.title}</h3>
                  <Pill color={meta.color}>
                    {meta.flag} {meta.name}
                  </Pill>
                </div>
                <span className="text-xs shrink-0">{PRIORITY_LABEL[idea.priority]}</span>
              </div>
              {idea.notes && <p className="text-sm text-slate-400 whitespace-pre-wrap">{idea.notes}</p>}
              {idea.estCost !== undefined && (
                <p className="text-xs text-slate-500">Est. cost: £{idea.estCost.toLocaleString()}</p>
              )}
              {idea.link && (
                <a
                  href={idea.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline block truncate"
                >
                  {idea.link}
                </a>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" onClick={() => openEdit(idea)}>
                  Edit
                </Button>
                <Button variant="primary" onClick={() => promote(idea)}>
                  Move to Booked
                </Button>
                <Button variant="danger" onClick={() => remove(idea.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <IdeaForm
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
            geocodePlace(data.title, countryIso2(data.country)).then((location) => {
              if (location) update(id, { location })
            })
          }}
        />
      )}
    </div>
  )
}

function IdeaForm({
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
    <Modal title={initial.title ? 'Edit idea' : 'New idea'} onClose={onCancel}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          await onSave(form)
          setSaving(false)
        }}
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Trek to Kuang Si Falls"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value as CountryCode })}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Idea['priority'] })}
            >
              <option value="high">🔥 High</option>
              <option value="medium">⭐ Medium</option>
              <option value="low">💭 Low</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Why you want to go, tips you've read, who recommended it…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="estCost">Est. cost (£)</Label>
            <Input
              id="estCost"
              type="number"
              min={0}
              step="0.01"
              value={form.estCost ?? ''}
              onChange={(e) => setForm({ ...form, estCost: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          📍 We'll automatically find this place on the map from its title — no coordinates needed. If the map pin
          ends up in the wrong spot, try making the title more specific (e.g. add the nearest city).
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save idea'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
