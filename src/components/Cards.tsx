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
  const getQty = (e: any) => {
    if (e.quantity !== undefined) return Number(e.quantity) || 0
    if (e.stock !== undefined) return Number(e.stock) || 0
    return 0
  }

  // (previously computed counts per type — not needed now)

  // low-stock items (individual entities with qty <= threshold)
  const lowItemsArr = entities
    .map((e) => ({ id: (e as any).id, name: e.name ?? null, type: e.type ?? 'Unknown', qty: getQty(e) }))
    .filter((x) => x.qty <= lowStockThreshold)
    .sort((a, b) => a.qty - b.qty)

  const lowStockItems = lowItemsArr.length

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
              <div className="text-sm text-gray-400">Low Stock Types (&le; {lowStockThreshold})</div>
              <div className="text-2xl font-bold">{lowStockItems}</div>
            </div>
            <div className="text-sm text-gray-400 text-right">
              {lowStockItems === 0 ? (
                <div className="text-gray-500">None</div>
              ) : (
                <div className="text-right">
                  <button id="view-all-low-small" onClick={() => setShowModal(true)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded">View All ({lowStockItems})</button>
                </div>
              )}
            </div>
          </div>
          {lowStockItems > 3 && (
            <div className="mt-3">
              <button id="view-all-low" onClick={() => setShowModal(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded">View All</button>
            </div>
          )}
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