import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import Table from './Table'
import type { Entity } from '../types/entity'

const sample: Entity[] = [
  { id: 1, type: 'widget', name: 'Test A', description: 'Desc A', created_at: new Date().toISOString() },
  { id: 2, type: 'widget', name: 'Test B', description: 'Desc B', created_at: new Date().toISOString() },
]

test('renders table with entities and actions', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<Table entities={sample} onEdit={onEdit} onDelete={onDelete} />)

  expect(screen.getByText('Entities')).toBeInTheDocument()
  expect(screen.getByText('Test A')).toBeInTheDocument()
  expect(screen.getByText('Test B')).toBeInTheDocument()
  // action buttons
  expect(screen.getAllByTitle('Edit').length).toBeGreaterThan(0)
  expect(screen.getAllByTitle('Delete').length).toBeGreaterThan(0)
})
