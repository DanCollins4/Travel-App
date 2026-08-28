import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../contexts/AuthContext'
import type { BookedItem, CountryCode, JournalEntry } from '../types'
import { COUNTRIES, countryMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Pill, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'
import { uploadJournalPhoto, deletePhotoByUrl } from '../utils/uploadPhoto'

type FormState = Omit<JournalEntry, 'id' | 'createdAt'>

function emptyForm(): FormState {
  return {
    title: '',
    date: new Date().toISOString().slice(0, 10),
    country: 'thailand',
    linkedBookingId: undefined,
    text: '',
    photoUrls: [],
  }
}

export default function JournalTab() {
  const { user } = useAuth()
  const { items, loading, addWithId, update, remove } = useCollection<JournalEntry>('journal')
  const { items: booked } = useCollection<BookedItem>('booked')
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [showForm, setShowForm] = useState(false)

  const sorted = useMemo(() => [...items].sort((a, b) => b.date.localeCompare(a.date)), [items])
  const bookingTitle = (id?: string) => booked.find((b) => b.id === id)?.title

  async function handleRemove(entry: JournalEntry) {
    if (!confirm(`Delete "${entry.title}"? This can't be undone.`)) return
    await Promise.all(entry.photoUrls.map(deletePhotoByUrl))
    await remove(entry.id)
  }

  if (!user) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Journal</h1>
          <p className="text-sm text-slate-400">A running log of what actually happened, with photos.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
        >
          + New entry
        </Button>
      </div>

      {!loading && sorted.length === 0 && (
        <EmptyState icon="📓" title="No entries yet" subtitle="Add your first journal entry once you're on the road." />
      )}

      <div className="space-y-4">
        {sorted.map((entry) => {
          const meta = countryMeta(entry.country)
          const linked = bookingTitle(entry.linkedBookingId)
          return (
            <Card key={entry.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-slate-100">{entry.title}</h3>
                  <p className="text-xs text-slate-500">
                    {format(parseISO(entry.date), 'EEE d MMM yyyy')}
                    {linked ? ` · 📍 ${linked}` : ''}
                  </p>
                </div>
                <Pill color={meta.color}>
                  {meta.flag} {meta.name}
                </Pill>
              </div>
              {entry.text && <p className="text-sm text-slate-300 whitespace-pre-wrap">{entry.text}</p>}
              {entry.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {entry.photoUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-slate-800">
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(entry)
                    setShowForm(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleRemove(entry)}>
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <JournalForm
          initial={editing}
          userId={user.uid}
          bookedItems={booked}
          onCancel={() => setShowForm(false)}
          onSave={async (id, data) => {
            if (editing) await update(editing.id, data)
            else await addWithId(id, data)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function JournalForm({
  initial,
  userId,
  bookedItems,
  onSave,
  onCancel,
}: {
  initial: JournalEntry | null
  userId: string
  bookedItems: BookedItem[]
  onSave: (id: string, data: FormState) => Promise<void>
  onCancel: () => void
}) {
  const [entryId] = useState(() => initial?.id ?? crypto.randomUUID())
  const [form, setForm] = useState<FormState>(initial ?? emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const fileArr = Array.from(files)
    setUploading((n) => n + fileArr.length)
    for (const file of fileArr) {
      try {
        const url = await uploadJournalPhoto(userId, entryId, file)
        setForm((f) => ({ ...f, photoUrls: [...f.photoUrls, url] }))
      } catch {
        alert(`Couldn't upload ${file.name} — check your connection and try again.`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  async function removePhoto(url: string) {
    setForm((f) => ({ ...f, photoUrls: f.photoUrls.filter((u) => u !== url) }))
    deletePhotoByUrl(url)
  }

  return (
    <Modal title={initial ? 'Edit entry' : 'New journal entry'} onClose={onCancel}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          await onSave(entryId, form)
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
            placeholder="e.g. First day in Chiang Mai"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
          <Label htmlFor="linkedBookingId">Linked stop (optional)</Label>
          <Select
            id="linkedBookingId"
            value={form.linkedBookingId ?? ''}
            onChange={(e) => setForm({ ...form, linkedBookingId: e.target.value || undefined })}
          >
            <option value="">— None —</option>
            {bookedItems.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="text">What happened</Label>
          <Textarea id="text" rows={5} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="photos">Photos</Label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-slate-100 hover:file:bg-slate-700"
          />
          {uploading > 0 && <p className="text-xs text-sky-400 mt-1">Uploading {uploading} photo{uploading > 1 ? 's' : ''}…</p>}
          {form.photoUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {form.photoUrls.map((url) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading > 0}>
            {saving ? 'Saving…' : uploading > 0 ? 'Uploading…' : 'Save entry'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
