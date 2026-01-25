import { useState } from 'react'
import type { Entity } from '../types/entity'
import ViewAll from './ViewAll'

type Props = {
  entities: Entity[]
  lowStockThreshold?: number
  currency?: string
}

export default function Cards({ entities, lowStockThreshold = 5, currency = 'USD' }: Props) {
  const total = entities.length
  const [showModal, setShowModal] = useState(false)

  // Quantity field may be `quantity` or `stock` (optional)
  // Return `number | undefined` so we can treat missing differently from zero
  const getQty = (e: any): number | undefined => {
    if (e.quantity !== undefined) {
      const n = Number(e.quantity)
      return Number.isFinite(n) ? n : undefined
    }
    if (e.stock !== undefined) {
      const n = Number(e.stock)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  // Build counts per unique (type + name) and then aggregate per type.
  const itemCounts = new Map<string, number>()
  const itemMeta = new Map<string, { type: string; name: string }>()

  entities.forEach((e) => {
    const type = e.type ?? 'Unknown'
    const name = e.name ?? ''
    const key = `${type}||${name}`
    const qtyVal = getQty(e)
    const add = qtyVal ?? 1 // default to 1 only when quantity is absent
    itemCounts.set(key, (itemCounts.get(key) ?? 0) + add)
    if (!itemMeta.has(key)) itemMeta.set(key, { type, name })
  })

  const typeCounts: Record<string, number> = {}
  for (const [key, qty] of itemCounts.entries()) {
    const meta = itemMeta.get(key)!
    typeCounts[meta.type] = (typeCounts[meta.type] ?? 0) + qty
  }

  const lowTypesArr = Object.keys(typeCounts)
    .map((t) => ({ type: t, qty: typeCounts[t] }))
    .filter((x) => x.qty <= lowStockThreshold)
    .sort((a, b) => a.qty - b.qty)

  // low-stock items: all unique (type+name) entries whose type is low
  const lowTypeSet = new Set(lowTypesArr.map((x) => x.type))
  const lowItemsArr = Array.from(itemCounts.entries())
    .map(([key, qty]) => {
      const meta = itemMeta.get(key)!
      return { id: undefined as number | undefined, name: meta.name || null, type: meta.type, qty }
    })
    .filter((x) => lowTypeSet.has(x.type))
    .sort((a, b) => a.type.localeCompare(b.type) || a.qty - b.qty)

  const lowStockItems = lowTypesArr.length

  // inventory value: price * qty (if qty missing, assume 1)
  const totalValue = entities.reduce((acc, e) => {
    const price = typeof e.price === 'number' ? e.price : (typeof e.price === 'string' ? Number(e.price) || 0 : 0)
    const qty = getQty(e) || 1
    return acc + price * qty
  }, 0)

  const added30d = entities.filter((e) => {
    if (!e.created_at) return false
    const created = new Date(e.created_at)
    if (Number.isNaN(created.getTime())) return false
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return days <= 30
  }).length

  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })

  return (
    <>
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Total Entities</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-400">Low Stock Entities (&le; {lowStockThreshold})</div>
              <div className="text-2xl font-bold">{lowStockItems}</div>
            </div>
            <div className="text-sm text-gray-400 text-right">
              {lowStockItems === 0 ? (
                <div className="text-gray-500">None</div>
              ) : (
                <button id="view-all-low" onClick={() => setShowModal(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded">View All</button>
              )}
            </div>
          </div>
          {/* View All button now shown inline in header */}
        </div>

        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Inventory Value</div>
          <div className="text-2xl font-bold">{fmt.format(totalValue)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-sm text-gray-400">Items Added (30d)</div>
          <div className="text-2xl font-bold">{added30d}</div>
        </div>
    </section>
    {showModal && <ViewAll items={lowItemsArr} onClose={() => setShowModal(false)} />}
    </>
  )
}