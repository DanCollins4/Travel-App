import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, BudgetCategory, BudgetEntry, CountryCode } from '../types'
import { COUNTRIES, countryMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Select } from '../components/ui'
import Modal from '../components/Modal'

const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  flights: '✈️ Flights',
  accommodation: '🏨 Accommodation',
  transport: '🚌 Local transport',
  food: '🍜 Food & drink',
  activities: '🧭 Activities & tours',
  visas: '🛂 Visas',
  insurance: '🛡️ Insurance',
  gear: '🎒 Gear',
  other: '📌 Other',
}

const TYPE_TO_CATEGORY: Record<BookedItem['type'], BudgetCategory> = {
  flight: 'flights',
  train: 'transport',
  bus: 'transport',
  ferry: 'transport',
  accommodation: 'accommodation',
  tour: 'activities',
  other: 'other',
}

type FormState = Omit<BudgetEntry, 'id' | 'createdAt'>
const emptyForm: FormState = {
  label: '',
  category: 'food',
  country: 'thailand',
  amount: 0,
  currency: 'GBP',
  planned: true,
}

export default function BudgetTab() {
  const budget = useCollection<BudgetEntry>('budget')
  const { items: booked } = useCollection<BookedItem>('booked')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BudgetEntry | null>(null)

  const byCategory = useMemo(() => {
    const totals = new Map<BudgetCategory, number>()
    for (const b of booked) totals.set(TYPE_TO_CATEGORY[b.type], (totals.get(TYPE_TO_CATEGORY[b.type]) ?? 0) + (b.cost ?? 0))
    for (const e of budget.items) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [booked, budget.items])

  const maxCategory = Math.max(1, ...byCategory.map(([, v]) => v))

  const bookedTotal = useMemo(() => booked.reduce((s, b) => s + (b.cost ?? 0), 0), [booked])
  const plannedTotal = useMemo(
    () => budget.items.filter((e) => e.planned).reduce((s, e) => s + e.amount, 0),
    [budget.items],
  )
  const spentExtra = useMemo(
    () => budget.items.filter((e) => !e.planned).reduce((s, e) => s + e.amount, 0),
    [budget.items],
  )
  const grandTotal = bookedTotal + plannedTotal + spentExtra

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Budget</h1>
          <p className="text-sm text-slate-400">Booked costs are pulled in automatically — add estimates here for everything else.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
        >
          + Add estimate
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center py-3">
          <p className="text-xl font-semibold">£{bookedTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Booked (confirmed)</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xl font-semibold">£{plannedTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Estimated</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xl font-semibold">£{spentExtra.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Other spent</p>
        </Card>
        <Card className="text-center py-3 border-sky-500/30 bg-sky-500/10">
          <p className="text-xl font-semibold text-sky-300">£{grandTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Grand total</p>
        </Card>
      </div>

      {byCategory.length > 0 && (
        <Card>
          <h3 className="font-medium text-slate-200 mb-3">By category</h3>
          <div className="space-y-2.5">
            {byCategory.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{CATEGORY_LABEL[cat]}</span>
                  <span>£{amount.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(amount / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h3 className="font-medium text-slate-200 mb-2">Estimates &amp; extra spending</h3>
        {budget.items.length === 0 ? (
          <EmptyState icon="💰" title="No estimates yet" subtitle="Add things like daily food budget, insurance, visas or gear." />
        ) : (
          <div className="space-y-2">
            {budget.items.map((entry) => {
              const meta = countryMeta(entry.country)
              return (
                <Card key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{entry.label}</p>
                    <p className="text-xs text-slate-500">
                      {CATEGORY_LABEL[entry.category]} · {meta.flag} {meta.name} · {entry.planned ? 'estimate' : 'spent'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">
                      {entry.currency} {entry.amount.toLocaleString()}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(entry)
                        setShowForm(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => budget.remove(entry.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <BudgetForm
          initial={editing ?? emptyForm}
          onCancel={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) await budget.update(editing.id, data)
            else await budget.add(data)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function BudgetForm({
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
    <Modal title={initial.label ? 'Edit estimate' : 'New estimate'} onClose={onCancel}>
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
          <Input id="label" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Daily food & drink" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as BudgetCategory })}>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="planned">Status</Label>
          <Select id="planned" value={form.planned ? 'planned' : 'spent'} onChange={(e) => setForm({ ...form, planned: e.target.value === 'planned' })}>
            <option value="planned">Estimate (not spent yet)</option>
            <option value="spent">Already spent</option>
          </Select>
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
