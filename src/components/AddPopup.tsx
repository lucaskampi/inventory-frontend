import React, { useState } from 'react'
import { createEntity } from '../api/entities'
import type { EntityCreatePayload, Entity } from '../types/entity'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: (e: Entity) => void
}

export default function AddPopup({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [typeVal, setTypeVal] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!typeVal) {
      setError('Type is required')
      return
    }
    const payload: EntityCreatePayload = {
      type: typeVal,
      name: name || undefined,
      description: description || undefined,
      price: price !== '' ? Number(price) : undefined,
    }
    try {
      setLoading(true)
      const created = await createEntity(payload)
      onCreated(created)
      // reset
      setName('')
      setTypeVal('')
      setDescription('')
      onClose()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create entity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Add Entity</h3>
        {error && <div className="mb-2 p-2 bg-red-800 text-red-100 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Type *</label>
            <input value={typeVal} onChange={(e) => setTypeVal(e.target.value)} required className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onClose()} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-400 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
