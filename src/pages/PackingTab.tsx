import { useMemo, useState, type FormEvent } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { PackingItem } from '../types'
import { PACKING_PRESET } from '../data/packingPreset'
import { Button, Card, EmptyState, Input } from '../components/ui'

export default function PackingTab() {
  const { items, loading, add, update, remove } = useCollection<PackingItem>('packing')
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('Other')

  const grouped = useMemo(() => {
    const map = new Map<string, PackingItem[]>()
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()]
  }, [items])

  const packedCount = items.filter((i) => i.packed).length

  async function loadPreset() {
    const existingLabels = new Set(items.map((i) => i.label))
    const toAdd = PACKING_PRESET.filter((p) => !existingLabels.has(p.label))
    for (const p of toAdd) {
      await add({ label: p.label, category: p.category, packed: false })
    }
  }

  async function addCustom(e: FormEvent) {
    e.preventDefault()
    if (!newLabel.trim()) return
    await add({ label: newLabel.trim(), category: newCategory.trim() || 'Other', packed: false })
    setNewLabel('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Packing list</h1>
          <p className="text-sm text-slate-400">
            {items.length > 0 ? `${packedCount} of ${items.length} packed` : 'Build your gap-year packing checklist.'}
          </p>
        </div>
        <Button variant="secondary" onClick={loadPreset}>
          + Load starter checklist
        </Button>
      </div>

      <form onSubmit={addCustom} className="flex flex-col sm:flex-row gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add an item…" className="flex-1" />
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category (e.g. Clothing)"
          className="sm:w-48"
        />
        <Button type="submit">Add</Button>
      </form>

      {!loading && items.length === 0 && (
        <EmptyState icon="🎒" title="Nothing on your list yet" subtitle="Load the starter checklist or add your own items above." />
      )}

      <div className="space-y-5">
        {grouped.map(([category, catItems]) => (
          <Card key={category}>
            <h3 className="font-medium text-slate-200 mb-2">{category}</h3>
            <div className="space-y-1">
              {catItems.map((item) => (
                <label key={item.id} className="flex items-center gap-3 py-1.5 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.packed}
                    onChange={(e) => update(item.id, { packed: e.target.checked })}
                    className="w-4 h-4 rounded accent-sky-500"
                  />
                  <span className={`flex-1 text-sm ${item.packed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-opacity"
                  >
                    Remove
                  </button>
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
