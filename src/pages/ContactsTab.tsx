import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useCollection } from '../hooks/useCollection'
import type { Contact, CountryCode } from '../types'
import { COUNTRIES, countryMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Pill, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'

type FormState = Omit<Contact, 'id' | 'createdAt'>

const emptyForm: FormState = {
  name: '',
  metWhere: '',
  metDate: new Date().toISOString().slice(0, 10),
  country: 'thailand',
  phone: '',
  email: '',
  social: '',
  notes: '',
}

export default function ContactsTab() {
  const { items, loading, add, update, remove } = useCollection<Contact>('contacts')
  const [editing, setEditing] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)

  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.metDate ?? '').localeCompare(a.metDate ?? '')),
    [items],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Contacts</h1>
          <p className="text-sm text-slate-400">People you meet along the way.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
        >
          + Add contact
        </Button>
      </div>

      {!loading && sorted.length === 0 && (
        <EmptyState icon="📇" title="No contacts yet" subtitle="Save people you meet — fellow travellers, hosts, guides — so you don't lose touch." />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((contact) => {
          const meta = countryMeta(contact.country)
          return (
            <Card key={contact.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-slate-100">{contact.name}</h3>
                <Pill color={meta.color}>
                  {meta.flag} {meta.name}
                </Pill>
              </div>
              <p className="text-xs text-slate-500">
                {contact.metWhere && `Met at ${contact.metWhere}`}
                {contact.metWhere && contact.metDate ? ' · ' : ''}
                {contact.metDate && format(parseISO(contact.metDate), 'd MMM yyyy')}
              </p>
              <div className="text-sm text-slate-300 space-y-0.5">
                {contact.phone && <p>📞 {contact.phone}</p>}
                {contact.email && <p>✉️ {contact.email}</p>}
                {contact.social && <p>💬 {contact.social}</p>}
              </div>
              {contact.notes && <p className="text-sm text-slate-400 whitespace-pre-wrap">{contact.notes}</p>}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(contact)
                    setShowForm(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(contact.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <ContactForm
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

function ContactForm({
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
    <Modal title={initial.name ? 'Edit contact' : 'New contact'} onClose={onCancel}>
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="metWhere">Met where</Label>
            <Input
              id="metWhere"
              value={form.metWhere}
              onChange={(e) => setForm({ ...form, metWhere: e.target.value })}
              placeholder="e.g. Full Moon hostel"
            />
          </div>
          <div>
            <Label htmlFor="metDate">Met on</Label>
            <Input id="metDate" type="date" value={form.metDate} onChange={(e) => setForm({ ...form, metDate: e.target.value })} />
          </div>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="social">Social / messaging</Label>
          <Input
            id="social"
            value={form.social}
            onChange={(e) => setForm({ ...form, social: e.target.value })}
            placeholder="Instagram, WhatsApp, etc."
          />
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
            {saving ? 'Saving…' : 'Save contact'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
