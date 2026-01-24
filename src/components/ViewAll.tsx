import { useState } from 'react'

type Item = { id?: number; name?: string | null; type: string; qty: number }

type Props = {
  items: Item[]
  onClose: () => void
}

export default function ViewAll({ items, onClose }: Props) {
  const [reordered, setReordered] = useState<Record<string, boolean>>({})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Low Stock Items</h3>
          <button id="close-low-modal" onClick={onClose} className="text-gray-400 hover:text-gray-200">Close</button>
        </div>
        <div className="space-y-3 max-h-80 overflow-auto">
          {items.length === 0 ? (
            <div className="text-gray-400">No low stock items.</div>
          ) : (
            items.map((it) => {
              const key = it.id ?? `${it.type}-${it.name ?? ''}`
              return (
                <div key={String(key)} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                  <div>
                    <div className="font-medium">{it.name ?? it.type}</div>
                    <div className="text-sm text-gray-400">Type: {it.type} · Quantity: {it.qty}</div>
                  </div>
                  <div>
                    {reordered[String(key)] ? (
                      <span className="text-green-400">Reordered</span>
                    ) : (
                      <button
                        id={`reorder-${encodeURIComponent(String(key))}`}
                        onClick={() => setReordered((s) => ({ ...s, [String(key)]: true }))}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
