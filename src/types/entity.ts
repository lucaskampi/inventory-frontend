export interface Entity {
	id: number
	type: string
	name?: string | null
	description?: string | null
	created_at: string
}

export type EntityCreatePayload = Omit<Entity, 'id' | 'created_at'>
export type EntityUpdatePayload = Partial<EntityCreatePayload>

