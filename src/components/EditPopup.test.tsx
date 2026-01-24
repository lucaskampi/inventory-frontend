import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, test, expect, beforeEach } from 'vitest'
import { formatNumberBR } from '../utils/number'

vi.mock('../api/entities', () => ({
  updateEntity: vi.fn(),
}))

import { updateEntity } from '../api/entities'
import EditPopup from './EditPopup'

beforeEach(() => {
  ;(updateEntity as unknown as vi.Mock)?.mockReset?.()
})

test('shows validation if type is missing', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 1, type: '', name: 'A', description: '', price: 0, created_at: new Date().toISOString() }
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  await user.click(screen.getByText('Save'))
  expect(await screen.findByText(/Type is required/i)).toBeInTheDocument()

  // fix and submit
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity, type: 'widget' })
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  await waitFor(() => expect(updateEntity).toHaveBeenCalled())
  expect(onSaved).toHaveBeenCalled()
  expect(onClose).toHaveBeenCalled()
})

test('submits form and calls updateEntity', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 2, type: 'widget', name: 'B', description: 'D', price: 100.5, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity, type: 'widget' })
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText(/Type/i))
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  await waitFor(() => expect(updateEntity).toHaveBeenCalled())
  expect(onSaved).toHaveBeenCalled()
  expect(onClose).toHaveBeenCalled()
})

test('formats price on focus and blur', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 3, type: 'widget', name: 'C', description: '', price: 1234.56, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity })
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement
  // initial formatted value
  expect(priceInput.value).toBe(formatNumberBR(entity.price))
  // focus -> shows raw numeric with comma
  await user.click(priceInput)
  expect(priceInput.value).toBe(String(entity.price).replace('.', ','))
  // blur -> formatted again
  await user.tab()
  expect(priceInput.value).toBe(formatNumberBR(entity.price))
})

test('shows API error when updateEntity fails', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 4, type: 'widget', name: 'D', description: '', price: 10, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockRejectedValue(new Error('boom'))
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText(/Type/i))
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  expect(await screen.findByText(/boom/i)).toBeInTheDocument()
})

test('submits payload without price when price input blank', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 5, type: 'widget', name: 'E', description: '', price: 25, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity })
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  // clear price input so parsed price becomes undefined
  const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement
  await user.clear(priceInput)
  // ensure price empty
  expect(priceInput.value).toBe('')
  // provide required type
  await user.clear(screen.getByLabelText(/Type/i))
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  await waitFor(() => expect(updateEntity).toHaveBeenCalled())
  const calledArgs = (updateEntity as unknown as vi.Mock).mock.calls[0]
  const payload = calledArgs[1]
  expect(payload.price).toBeUndefined()
})

test('Cancel button calls onClose', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 6, type: 'widget', name: 'F', description: '', price: 0, created_at: new Date().toISOString() }
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  await user.click(screen.getByText('Cancel'))
  expect(onClose).toHaveBeenCalled()
})

test('does not render when closed (early return)', () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 7, type: 'widget', name: 'G', description: '', price: 1, created_at: new Date().toISOString() }
  const { queryByText } = render(<EditPopup isOpen={false} entity={entity} onClose={onClose} onSaved={onSaved} />)
  expect(queryByText(/Edit Entity/i)).toBeNull()
})

test('submits payload with name/description undefined when cleared', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 8, type: 'widget', name: 'Keep', description: 'KeepDesc', price: 50, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity })
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  // clear name and description so they become undefined in payload
  await user.clear(screen.getByLabelText(/Name/i))
  await user.clear(screen.getByLabelText(/Description/i))
  // ensure type present
  await user.clear(screen.getByLabelText(/Type/i))
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  await waitFor(() => expect(updateEntity).toHaveBeenCalled())
  const calledArgs = (updateEntity as unknown as vi.Mock).mock.calls[0]
  const payload = calledArgs[1]
  expect(payload.name).toBeUndefined()
  expect(payload.description).toBeUndefined()
})

test('Save button shows loading state while updateEntity pending', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 9, type: 'widget', name: 'H', description: '', price: 5, created_at: new Date().toISOString() }
  // create deferred promise
  let resolve!: (v?: any) => void
  const p = new Promise((res) => { resolve = res })
  ;(updateEntity as unknown as vi.Mock).mockReturnValue(p)
  render(<EditPopup isOpen={true} entity={entity} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText(/Type/i))
  await user.type(screen.getByLabelText(/Type/i), 'widget')
  await user.click(screen.getByText('Save'))
  // button should show saving and be disabled while promise pending
  const saveBtn = screen.getByRole('button', { name: /Saving...|Save/i })
  expect(saveBtn).toBeDisabled()
  expect(saveBtn.textContent).toMatch(/Saving.../)
  // resolve and await completion
  resolve({ ...entity })
  await waitFor(() => expect(onSaved).toHaveBeenCalled())
})

test('focus/blur keeps empty price as empty (invalid/blank)', async () => {
  const onClose = vi.fn()
  const onSaved = vi.fn()
  const entity = { id: 10, type: 'widget', name: 'I', description: '', price: undefined, created_at: new Date().toISOString() }
  ;(updateEntity as unknown as vi.Mock).mockResolvedValue({ ...entity })
  render(<EditPopup isOpen={true} entity={entity as any} onClose={onClose} onSaved={onSaved} />)
  const user = userEvent.setup()
  const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement
  // ensure starts empty
  expect(priceInput.value).toBe('')
  await user.click(priceInput)
  expect(priceInput.value).toBe('')
  await user.tab()
  expect(priceInput.value).toBe('')
})
