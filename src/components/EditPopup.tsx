import React, { useEffect, useState } from 'react'
import { updateEntity } from '../api/entities'
import type { Entity, EntityUpdatePayload } from '../types/entity'
import { formatNumberBR, parseBRInput } from '../utils/number'

type Props = {
  isOpen: boolean
  entity: Entity
  onClose: () => void
  onSaved: (e: Entity) => void
}

export default function EditPopup({ isOpen, entity, onClose, onSaved }: Props) {
  const [name, setName] = useState(entity?.name ?? '')
  const [typeVal, setTypeVal] = useState(entity?.type ?? '')
  const [description, setDescription] = useState(entity?.description ?? '')
  const [price, setPrice] = useState(entity?.price != null ? formatNumberBR(entity.price) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(entity?.name ?? '')
    setTypeVal(entity?.type ?? '')
    setDescription(entity?.description ?? '')
    setPrice(entity?.price != null ? formatNumberBR(entity.price) : '')
  }, [entity])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!typeVal) {
      setError('Type is required')
      return
    }
    const parsed = parseBRInput(price)
    const payload: EntityUpdatePayload = {
      type: typeVal,
      name: name || undefined,
      description: description || undefined,
      price: parsed !== undefined ? parsed : undefined
    }
    try {
      setLoading(true)
      const updated = await updateEntity(entity.id, payload)
      onSaved(updated)
      onClose()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to update entity')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Edit Entity</h3>
        {error && <div className="mb-2 p-2 bg-red-800 text-red-100 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="edit-name-input" className="block text-sm text-gray-300">Name</label>
            <input id="edit-name-input" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div>
            <label htmlFor="edit-type-input" className="block text-sm text-gray-300">Type *</label>
            <input id="edit-type-input" value={typeVal} onChange={(e) => setTypeVal(e.target.value)} className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div>
            <label htmlFor="edit-price-input" className="block text-sm text-gray-300">Price</label>
            <input
              id="edit-price-input"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, ''))}
              onBlur={() => {
                const parsed = parseBRInput(price)
                setPrice(parsed !== undefined ? formatNumberBR(parsed) : '')
              }}
              onFocus={() => {
                const parsed = parseBRInput(price)
                setPrice(parsed !== undefined ? String(parsed).replace('.', ',') : '')
              }}
              placeholder="0,00"
              inputMode="decimal"
              className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700"
            />
          </div>
          <div>
            <label htmlFor="edit-description-input" className="block text-sm text-gray-300">Description</label>
            <input id="edit-description-input" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-2 py-1 rounded bg-gray-900 text-gray-100 border border-gray-700" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onClose()} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
