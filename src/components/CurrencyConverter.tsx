import { useEffect, useState } from 'react'
import { getRates, TRAVEL_CURRENCIES } from '../utils/currency'
import { Card, Input, Select } from './ui'

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('GBP')
  const [to, setTo] = useState('THB')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [asOf, setAsOf] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getRates(from).then((result) => {
      if (cancelled) return
      if (!result) {
        setError(true)
      } else {
        setRates(result.rates)
        setAsOf(result.date)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [from])

  const numericAmount = parseFloat(amount) || 0
  const rate = rates?.[to]
  const converted = rate ? numericAmount * rate : null

  return (
    <Card>
      <h3 className="font-medium text-slate-200 mb-3">💱 Currency converter</h3>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[100px]">
          <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Select value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto">
          {TRAVEL_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => {
            setFrom(to)
            setTo(from)
          }}
          className="rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          aria-label="Swap currencies"
        >
          ⇄
        </button>
        <Select value={to} onChange={(e) => setTo(e.target.value)} className="w-auto">
          {TRAVEL_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3">
        {loading && <p className="text-sm text-slate-500">Fetching rates…</p>}
        {!loading && error && (
          <p className="text-sm text-amber-400">
            Couldn't fetch live rates right now (needs an internet connection) — try again shortly.
          </p>
        )}
        {!loading && !error && converted !== null && (
          <p className="text-2xl font-semibold text-slate-100">
            {numericAmount.toLocaleString()} {from} ≈ {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
          </p>
        )}
        {asOf && <p className="text-xs text-slate-500 mt-1">Rates as of {asOf} · via exchangerate-api.com</p>}
      </div>
    </Card>
  )
}
