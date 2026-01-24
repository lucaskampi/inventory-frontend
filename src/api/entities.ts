import api from './client'
import type { Entity, EntityCreatePayload, EntityUpdatePayload } from '../types/entity'

function normalizeEntity(raw: any): Entity {
  const priceFromUnit = raw.unit_price !== undefined && raw.unit_price !== null ? Number(raw.unit_price) : undefined
  const priceFromPrice = raw.price !== undefined && raw.price !== null ? Number(raw.price) : undefined
  const price = Number.isFinite(priceFromPrice) ? priceFromPrice : (Number.isFinite(priceFromUnit) ? priceFromUnit : null)

  return {
    id: raw.id,
    type: raw.type,
    name: raw.name ?? null,
    description: raw.description ?? null,
    price,
    created_at: raw.created_at,
  }
}

function outgoingPayload(payload: any) {
  // Convert frontend `price` to backend `unit_price` if present
  const body = { ...payload }
  if (body.price !== undefined) {
    body.unit_price = body.price
    delete body.price
  }
  return body
}

export async function listEntities(): Promise<Entity[]> {
  const res = await api.get<any>('/entities')
  const data = res.data as any[]
  return data.map(normalizeEntity)
}

export async function getEntity(id: number): Promise<Entity> {
  const res = await api.get<any>(`/entities/${id}`)
  return normalizeEntity(res.data)
}

export async function createEntity(payload: EntityCreatePayload): Promise<Entity> {
  const body = outgoingPayload(payload)
  const res = await api.post<any>('/entities', body)
  return normalizeEntity(res.data)
}

export async function updateEntity(id: number, payload: EntityUpdatePayload): Promise<Entity> {
  const body = outgoingPayload(payload)
  const res = await api.put<any>(`/entities/${id}`, body)
  return normalizeEntity(res.data)
}

export async function deleteEntity(id: number): Promise<void> {
  await api.delete(`/entities/${id}`)
}
