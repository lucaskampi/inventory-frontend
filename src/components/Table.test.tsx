import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  // action buttons: one per row
  const editButtons = screen.getAllByTitle('Edit')
  const deleteButtons = screen.getAllByTitle('Delete')
  expect(editButtons).toHaveLength(sample.length)
  expect(deleteButtons).toHaveLength(sample.length)
})

test('calls edit and delete handlers when action buttons clicked', async () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<Table entities={sample} onEdit={onEdit} onDelete={onDelete} />)
  const user = userEvent.setup()
  const editButtons = screen.getAllByTitle('Edit')
  const deleteButtons = screen.getAllByTitle('Delete')
  await user.click(editButtons[0])
  expect(onEdit).toHaveBeenCalledWith(sample[0])
  await user.click(deleteButtons[1])
  expect(onDelete).toHaveBeenCalledWith(sample[1].id)
})

test('shows loading, empty and error states', async () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  // loading true should show Loading... when no entities
  render(<Table entities={[]} onEdit={onEdit} onDelete={onDelete} loading={true} />)
  expect(await screen.findByText(/Loading.../i)).toBeInTheDocument()

  // error message renders
  render(<Table entities={[]} onEdit={onEdit} onDelete={onDelete} error="Network failed" />)
  expect(await screen.findByText(/Network failed/)).toBeInTheDocument()
})

test('filters by name, type and description', async () => {
  const items = [
    { id: 1, type: 'widget', name: 'Alpha', description: 'first', price: 1 },
    { id: 2, type: 'gadget', name: 'Beta', description: 'second', price: 2 },
  ]
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<Table entities={items as any} onEdit={onEdit} onDelete={onDelete} />)
  const user = userEvent.setup()

  // inputs: name, type, desc are the three textbox inputs
  const inputs = screen.getAllByRole('textbox')
  // filter by name
  await user.type(inputs[0], 'Alpha')
  expect(screen.getByText('Alpha')).toBeInTheDocument()
  expect(screen.queryByText('Beta')).not.toBeInTheDocument()

  // clear and filter by type
  await user.clear(inputs[0])
  await user.type(inputs[1], 'gadget')
  expect(screen.getByText('Beta')).toBeInTheDocument()
  expect(screen.queryByText('Alpha')).not.toBeInTheDocument()

  // description filter
  await user.clear(inputs[1])
  await user.type(inputs[2], 'first')
  expect(screen.getByText('Alpha')).toBeInTheDocument()
})

test('calls onAdd and onRefresh and handles page size and pagination', async () => {
  const many = Array.from({ length: 12 }).map((_, i) => ({ id: i + 1, type: 't', name: `N${i + 1}`, description: '', price: 0 }))
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onAdd = vi.fn()
  const onRefresh = vi.fn()
  render(<Table entities={many as any} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} onRefresh={onRefresh} initialPageSize={5} />)
  const user = userEvent.setup()

  // Add button
  await user.click(screen.getByTitle('Add'))
  expect(onAdd).toHaveBeenCalled()

  // Refresh button
  await user.click(screen.getByTitle('Refresh'))
  expect(onRefresh).toHaveBeenCalled()

  // page controls: next page should show different item
  expect(screen.getByText('Showing 12 of 12')).toBeInTheDocument()
  await user.click(screen.getByText('>'))
  expect(screen.getByText('N6')).toBeInTheDocument()

  // change page size
  await user.selectOptions(screen.getByRole('combobox'), '25')
  expect(screen.getByText(/Showing 12 of 12/)).toBeInTheDocument()
})

test('formatPrice displays dash for missing and formatted numbers/strings', () => {
  const items = [
    { id: 1, type: 't', name: 'A', description: '', price: undefined },
    { id: 2, type: 't', name: 'B', description: '', price: null },
    { id: 3, type: 't', name: 'C', description: '', price: 1234.56 },
    { id: 4, type: 't', name: 'D', description: '', price: '9.5' as any },
  ]
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<Table entities={items as any} onEdit={onEdit} onDelete={onDelete} />)
  // dash for undefined/null - there should be at least two
  expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  // formatted numbers should contain the expected pt-BR strings
  expect(screen.getByText('1.234,56')).toBeInTheDocument()
  expect(screen.getByText('9,50')).toBeInTheDocument()
})
