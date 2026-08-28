import { useMemo, useState, type FormEvent } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { PackingItem, PackingList } from '../types'
import { PACKING_PRESET } from '../data/packingPreset'
import { CLIMATE_PRESETS, climatePreset } from '../data/climatePackingPresets'
import { Button, Card, EmptyState, Input, Label, Select } from '../components/ui'
import Modal from '../components/Modal'

const GENERAL_LIST_ID = 'general'

export default function PackingTab() {
  const { items, loading, add, update, remove } = useCollection<PackingItem>('packing')
  const lists = useCollection<PackingList>('packingLists')
  const [activeListId, setActiveListId] = useState(GENERAL_LIST_ID)
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('Other')
  const [showNewList, setShowNewList] = useState(false)

  const activeItems = useMemo(
    () => items.filter((i) => (i.listId ?? GENERAL_LIST_ID) === activeListId),
    [items, activeListId],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, PackingItem[]>()
    for (const item of activeItems) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()]
  }, [activeItems])

  const packedCount = activeItems.filter((i) => i.packed).length
  const activeList = lists.items.find((l) => l.id === activeListId)

  async function loadPreset() {
    const existingLabels = new Set(activeItems.map((i) => i.label))
    const toAdd = PACKING_PRESET.filter((p) => !existingLabels.has(p.label))
    for (const p of toAdd) {
      await add({ label: p.label, category: p.category, packed: false, listId: GENERAL_LIST_ID })
    }
  }

  async function addCustom(e: FormEvent) {
    e.preventDefault()
    if (!newLabel.trim()) return
    await add({ label: newLabel.trim(), category: newCategory.trim() || 'Other', packed: false, listId: activeListId })
    setNewLabel('')
  }

  async function deleteActiveList() {
    if (!activeList) return
    if (!confirm(`Delete the "${activeList.name}" list and all its items?`)) return
    await Promise.all(activeItems.map((i) => remove(i.id)))
    await lists.remove(activeList.id)
    setActiveListId(GENERAL_LIST_ID)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Packing lists</h1>
          <p className="text-sm text-slate-400">
            {activeItems.length > 0 ? `${packedCount} of ${activeItems.length} packed` : 'Build your gap-year packing checklist.'}
          </p>
        </div>
        <div className="flex gap-2">
          {activeListId === GENERAL_LIST_ID ? (
            <Button variant="secondary" onClick={loadPreset}>
              + Load starter checklist
            </Button>
          ) : (
            <Button variant="danger" onClick={deleteActiveList}>
              Delete list
            </Button>
          )}
          <Button onClick={() => setShowNewList(true)}>+ New list</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveListId(GENERAL_LIST_ID)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm border ${
            activeListId === GENERAL_LIST_ID ? 'bg-slate-100 text-slate-900 border-slate-100 font-medium' : 'border-slate-700 text-slate-400'
          }`}
        >
          🎒 General
        </button>
        {lists.items.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveListId(l.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm border ${
              activeListId === l.id ? 'bg-slate-100 text-slate-900 border-slate-100 font-medium' : 'border-slate-700 text-slate-400'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Keep the general list as your full trip checklist, and spin up extra lists for specific legs or climates —
        e.g. a cold-weather list for trekking in Sapa, or a beach list for the islands.
      </p>

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

      {!loading && activeItems.length === 0 && (
        <EmptyState icon="🎒" title="Nothing on this list yet" subtitle="Load a preset or add your own items above." />
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

      {showNewList && (
        <NewListModal
          onClose={() => setShowNewList(false)}
          onCreate={async (name, climateId) => {
            const listId = await lists.add({ name, climate: climateId || undefined })
            if (!listId) return
            const preset = climateId ? climatePreset(climateId) : undefined
            if (preset) {
              for (const p of preset.items) {
                await add({ label: p.label, category: p.category, packed: false, listId })
              }
            }
            setActiveListId(listId)
            setShowNewList(false)
          }}
        />
      )}
    </div>
  )
}

function NewListModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, climateId: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [climateId, setClimateId] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <Modal title="New packing list" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!name.trim()) return
          setSaving(true)
          await onCreate(name.trim(), climateId)
          setSaving(false)
        }}
      >
        <div>
          <Label htmlFor="listName">List name</Label>
          <Input id="listName" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sapa trek" />
        </div>
        <div>
          <Label htmlFor="climate">Start from a preset (optional)</Label>
          <Select id="climate" value={climateId} onChange={(e) => setClimateId(e.target.value)}>
            <option value="">— Start empty —</option>
            {CLIMATE_PRESETS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create list'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
