import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { BookedItem, BudgetCategory, BudgetEntry, BudgetScope, CountryReview, DocumentItem } from '../types'
import { COUNTRIES, spendScopeMeta } from '../data/countryMeta'
import { Button, Card, EmptyState, Input, Label, Select, Textarea } from '../components/ui'
import Modal from '../components/Modal'
import CurrencyConverter from '../components/CurrencyConverter'

const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  flights: '✈️ Flights',
  accommodation: '🏨 Accommodation',
  transport: '🚌 Local transport',
  food: '🍜 Food & drink',
  activities: '🧭 Activities & tours',
  visas: '🛂 Visas',
  insurance: '🛡️ Insurance',
  vaccinations: '💉 Vaccinations',
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

const DOCUMENT_CATEGORY_TO_BUDGET: Record<DocumentItem['category'], BudgetCategory> = {
  passport: 'other',
  visa: 'visas',
  insurance: 'insurance',
  vaccination: 'vaccinations',
  booking: 'other',
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
  const { items: documents } = useCollection<DocumentItem>('documents')
  const reviews = useCollection<CountryReview>('countryReviews')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BudgetEntry | null>(null)
  const [reviewingCountry, setReviewingCountry] = useState<BudgetScope | null>(null)

  const byCategory = useMemo(() => {
    const totals = new Map<BudgetCategory, number>()
    for (const b of booked) totals.set(TYPE_TO_CATEGORY[b.type], (totals.get(TYPE_TO_CATEGORY[b.type]) ?? 0) + (b.cost ?? 0))
    for (const e of budget.items) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    for (const d of documents) {
      const cat = DOCUMENT_CATEGORY_TO_BUDGET[d.category]
      totals.set(cat, (totals.get(cat) ?? 0) + (d.cost ?? 0))
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [booked, budget.items, documents])

  const byCountry = useMemo(() => {
    const totals = new Map<BudgetScope, number>()
    for (const b of booked) totals.set(b.country, (totals.get(b.country) ?? 0) + (b.cost ?? 0))
    for (const e of budget.items) totals.set(e.country, (totals.get(e.country) ?? 0) + e.amount)
    for (const d of documents) totals.set(d.country ?? 'trip', (totals.get(d.country ?? 'trip') ?? 0) + (d.cost ?? 0))
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [booked, budget.items, documents])

  // What you'd estimated for each scope before arriving — just the entries
  // explicitly marked as estimates, so this reflects what you actually guessed.
  const estimatedByCountry = useMemo(() => {
    const totals = new Map<BudgetScope, number>()
    for (const e of budget.items.filter((e) => e.planned)) totals.set(e.country, (totals.get(e.country) ?? 0) + e.amount)
    return totals
  }, [budget.items])

  // Everything the app already knows you've actually committed/spent per
  // scope — used to pre-fill the "actual spend" field as a starting point.
  const trackedByCountry = useMemo(() => {
    const totals = new Map<BudgetScope, number>()
    for (const b of booked) totals.set(b.country, (totals.get(b.country) ?? 0) + (b.cost ?? 0))
    for (const e of budget.items.filter((e) => !e.planned)) totals.set(e.country, (totals.get(e.country) ?? 0) + e.amount)
    for (const d of documents) {
      if (!d.country || d.country === 'trip') continue
      totals.set(d.country, (totals.get(d.country) ?? 0) + (d.cost ?? 0))
    }
    return totals
  }, [booked, budget.items, documents])

  const reviewedCountries = useMemo(() => {
    const codes = new Set<BudgetScope>([...estimatedByCountry.keys(), ...reviews.items.map((r) => r.country)])
    return [...codes].sort((a, b) => spendScopeMeta(a).name.localeCompare(spendScopeMeta(b).name))
  }, [estimatedByCountry, reviews.items])

  const maxCategory = Math.max(1, ...byCategory.map(([, v]) => v))
  const maxCountry = Math.max(1, ...byCountry.map(([, v]) => v))

  const bookedTotal = useMemo(() => booked.reduce((s, b) => s + (b.cost ?? 0), 0), [booked])
  const plannedTotal = useMemo(
    () => budget.items.filter((e) => e.planned).reduce((s, e) => s + e.amount, 0),
    [budget.items],
  )
  const spentExtra = useMemo(
    () => budget.items.filter((e) => !e.planned).reduce((s, e) => s + e.amount, 0),
    [budget.items],
  )
  const documentsTotal = useMemo(() => documents.reduce((s, d) => s + (d.cost ?? 0), 0), [documents])
  const grandTotal = bookedTotal + plannedTotal + spentExtra + documentsTotal

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="text-center py-3">
          <p className="text-xl font-semibold">£{bookedTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Booked (confirmed)</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xl font-semibold">£{documentsTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Docs &amp; prep</p>
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

      <CurrencyConverter />

      {byCategory.length > 0 && (
        <Card>
          <h3 className="font-medium text-slate-200 mb-3">By category</h3>
          <div className="space-y-2.5">
            {byCategory.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{CATEGORY_LABEL[cat]}</span>
                  <span>
                    £{amount.toLocaleString()}
                    <span className="text-slate-600"> · {Math.round((amount / grandTotal) * 100) || 0}%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(amount / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {byCountry.length > 0 && (
        <Card>
          <h3 className="font-medium text-slate-200 mb-3">By country</h3>
          <div className="space-y-2.5">
            {byCountry.map(([code, amount]) => {
              const meta = spendScopeMeta(code)
              return (
                <div key={code}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>
                      {meta.flag} {meta.name}
                    </span>
                    <span>
                      £{amount.toLocaleString()}
                      <span className="text-slate-600"> · {Math.round((amount / grandTotal) * 100) || 0}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(amount / maxCountry) * 100}%`, backgroundColor: meta.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-200">Country wrap-up: estimate vs actual</h3>
        </div>
        {reviewedCountries.length === 0 ? (
          <EmptyState
            icon="🧮"
            title="Nothing to compare yet"
            subtitle="Once you've added an estimate for a country, you'll be able to log what you actually spent there and see the difference."
          />
        ) : (
          <div className="space-y-2">
            {reviewedCountries.map((code) => {
              const meta = spendScopeMeta(code)
              const estimated = estimatedByCountry.get(code) ?? 0
              const review = reviews.items.find((r) => r.country === code)
              const actual = review?.actualSpend
              const diff = actual !== undefined ? actual - estimated : undefined
              return (
                <Card key={code} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-100">
                      {meta.flag} {meta.name}
                    </span>
                    <Button variant="secondary" onClick={() => setReviewingCountry(code)}>
                      {review ? 'Edit' : '+ Log actual spend'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-semibold text-slate-200">£{estimated.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Estimated</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-200">
                        {actual !== undefined ? `£${actual.toLocaleString()}` : '—'}
                      </p>
                      <p className="text-xs text-slate-500">Actual</p>
                    </div>
                    <div>
                      <p className={`text-lg font-semibold ${diff === undefined ? 'text-slate-500' : diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {diff === undefined ? '—' : `${diff > 0 ? '+' : diff < 0 ? '-' : ''}£${Math.abs(diff).toLocaleString()}`}
                      </p>
                      <p className="text-xs text-slate-500">{diff === undefined ? 'Difference' : diff > 0 ? 'Over budget' : diff < 0 ? 'Under budget' : 'Bang on'}</p>
                    </div>
                  </div>
                  {review?.reason && <p className="text-sm text-slate-400 border-t border-slate-800 pt-2">{review.reason}</p>}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium text-slate-200 mb-2">Estimates &amp; extra spending</h3>
        {budget.items.length === 0 ? (
          <EmptyState icon="💰" title="No estimates yet" subtitle="Add things like daily food budget, insurance, visas or gear." />
        ) : (
          <div className="space-y-2">
            {budget.items.map((entry) => {
              const meta = spendScopeMeta(entry.country)
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

      {reviewingCountry && (
        <CountryReviewModal
          country={reviewingCountry}
          initial={reviews.items.find((r) => r.country === reviewingCountry) ?? null}
          suggestedAmount={trackedByCountry.get(reviewingCountry) ?? 0}
          onCancel={() => setReviewingCountry(null)}
          onSave={async (data) => {
            await reviews.addWithId(reviewingCountry, data)
            setReviewingCountry(null)
          }}
          onDelete={async () => {
            await reviews.remove(reviewingCountry)
            setReviewingCountry(null)
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
            <Select id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as BudgetScope })}>
              <option value="international">✈️ International travel</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <p className="text-xs text-slate-500 -mt-1">
          Pick "International travel" for costs that cross borders (like a flight between two countries) so they
          aren't credited to either side.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min={0} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
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

function CountryReviewModal({
  country,
  initial,
  suggestedAmount,
  onSave,
  onCancel,
  onDelete,
}: {
  country: BudgetScope
  initial: CountryReview | null
  suggestedAmount: number
  onSave: (data: Omit<CountryReview, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
  onDelete: () => Promise<void>
}) {
  const meta = spendScopeMeta(country)
  const [actualSpend, setActualSpend] = useState(initial?.actualSpend ?? suggestedAmount)
  const [currency, setCurrency] = useState(initial?.currency ?? 'GBP')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={`${meta.flag} ${meta.name} — actual spend`} onClose={onCancel}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          await onSave({ country, actualSpend, currency, reason })
          setSaving(false)
        }}
      >
        <p className="text-xs text-slate-500">
          Pre-filled with what the app has already tracked for {meta.name} — adjust it to match your bank/Revolut
          statement for the real total.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="actualSpend">Actual spend</Label>
            <Input
              id="actualSpend"
              type="number"
              min={0}
              step="0.01"
              required
              value={actualSpend}
              onChange={(e) => setActualSpend(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="reviewCurrency">Currency</Label>
            <Input id="reviewCurrency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="reason">Reason for the difference (optional)</Label>
          <Textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Went over on activities — did a diving course we hadn't planned for"
          />
        </div>
        <div className="flex justify-between gap-2 pt-2">
          {initial ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
