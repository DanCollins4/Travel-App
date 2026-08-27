import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { DocumentItem } from '../types'
import { DOCUMENTS_PRESET } from '../data/documentsPreset'
import { Button, Card, EmptyState, Input, Label, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'

const CATEGORY_LABEL: Record<DocumentItem['category'], string> = {
  passport: '🛂 Passport',
  visa: '📋 Visas',
  insurance: '🛡️ Insurance',
  vaccination: '💉 Health',
  booking: '🎫 Bookings',
  other: '📌 Other',
}

type FormState = Omit<DocumentItem, 'id' | 'createdAt'>
const emptyForm: FormState = { label: '', category: 'other', notes: '', link: '', done: false }

export default function DocumentsTab() {
  const { items, loading, add, update, remove } = useCollection<DocumentItem>('documents')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DocumentItem | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<DocumentItem['category'], DocumentItem[]>()
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()]
  }, [items])

  const doneCount = items.filter((i) => i.done).length

  async function loadPreset() {
    const existing = new Set(items.map((i) => i.label))
    for (const p of DOCUMENTS_PRESET) {
      if (!existing.has(p.label)) await add({ label: p.label, category: p.category, notes: p.notes, link: '', done: false })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Documents &amp; prep</h1>
          <p className="text-sm text-slate-400">
            {items.length > 0 ? `${doneCount} of ${items.length} sorted` : 'Track visas, insurance, vaccinations and other admin.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadPreset}>
            + Load checklist
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            + Add item
          </Button>
        </div>
      </div>

      {!loading && items.length === 0 && (
        <EmptyState icon="📄" title="Nothing tracked yet" subtitle="Load the starter checklist to cover the essentials." />
      )}

      <div className="space-y-5">
        {grouped.map(([category, catItems]) => (
          <Card key={category}>
            <h3 className="font-medium text-slate-200 mb-2">{CATEGORY_LABEL[category]}</h3>
            <div className="space-y-1">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-1.5 group">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => update(item.id, { done: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded accent-sky-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.label}</p>
                    {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                        {item.link}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditing(item)
                      setShowForm(true)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 text-xs transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <DocumentForm
          initial={editing ?? emptyForm}
          onCancel={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) await update(editing.id, data)
            else await add(data)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function DocumentForm({
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
    <Modal title={initial.label ? 'Edit item' : 'New item'} onClose={onCancel}>
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
          <Label htmlFor="label">Label</Label>
          <Input id="label" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentItem['category'] })}>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="link">Link</Label>
          <Input id="link" type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
