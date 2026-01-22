import api from './client'
import type { Entity, EntityCreatePayload, EntityUpdatePayload } from '../types/entity'

export async function listEntities(): Promise<Entity[]> {
  const res = await api.get<Entity[]>('/entities')
  return res.data
}

export async function getEntity(id: number): Promise<Entity> {
  const res = await api.get<Entity>(`/entities/${id}`)
  return res.data
}

export async function createEntity(payload: EntityCreatePayload): Promise<Entity> {
  const res = await api.post<Entity>('/entities', payload)
  return res.data
}

export async function updateEntity(id: number, payload: EntityUpdatePayload): Promise<Entity> {
  const res = await api.put<Entity>(`/entities/${id}`, payload)
  return res.data
}

export async function deleteEntity(id: number): Promise<void> {
  await api.delete(`/entities/${id}`)
}
