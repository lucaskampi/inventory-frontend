import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../api/entities', () => ({
  createEntity: vi.fn(),
}))

import { createEntity } from '../api/entities'
import AddPopup from './AddPopup'

describe('AddPopup', () => {
  beforeEach(() => {
    ;(createEntity as unknown as vi.Mock)?.mockReset?.()
  })

  it('shows validation if type is missing', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Save'))
    const err = await screen.findByText(/Type is required/i)
    expect(err).toBeVisible()

    // fix the validation and submit to ensure the form proceeds
    ;(createEntity as unknown as vi.Mock).mockResolvedValue({ id: 11, type: 'widget', name: 'Z', description: '', price: 0, created_at: new Date().toISOString() })
    await user.type(screen.getByLabelText(/Type/i), 'widget')
    await user.click(screen.getByText('Save'))
    await screen.findByText(/Saving...|Save/)
    await waitFor(() => expect(createEntity).toHaveBeenCalled())
    expect(onCreated).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('submits form and calls createEntity', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    ;(createEntity as unknown as vi.Mock).mockResolvedValue({ id: 10, type: 'widget', name: 'X', description: 'D', price: 1234.56, created_at: new Date().toISOString() })

    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Type/i), 'widget')
    await user.type(screen.getByLabelText(/Price/i), '1.234,56')
    await user.click(screen.getByText('Save'))

    await waitFor(() => expect(createEntity).toHaveBeenCalled())
    expect(onCreated).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('includes name and description in payload when provided', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    const mockCreate = (createEntity as unknown as vi.Mock).mockResolvedValueOnce({ id: 30, type: 'widget', name: 'Filled', description: 'Desc' })

    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/Type/i), 'widget')
    await user.type(screen.getByLabelText(/Name/i), 'Filled')
    await user.type(screen.getByLabelText(/Description/i), 'Desc')
    await user.click(screen.getByText('Save'))

    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
    const payload = mockCreate.mock.calls[0][0]
    expect(payload).toHaveProperty('name', 'Filled')
    expect(payload).toHaveProperty('description', 'Desc')
    expect(onCreated).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('formats price on focus and blur', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement
    // type a pt-BR formatted value and blur -> should format
    await user.type(priceInput, '1.234,56')
    // blur -> formatted again
    await user.tab()
    expect(priceInput.value).toBe('1.234,56')
  })

  it('shows API error when createEntity fails', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    ;(createEntity as unknown as vi.Mock).mockRejectedValueOnce(new Error('create-fail'))

    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/Type/i), 'widget')
    await user.click(screen.getByText('Save'))
    expect(await screen.findByText(/create-fail/i)).toBeInTheDocument()
  })

  it('submits with undefined price when price is empty', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    const mockCreate = (createEntity as unknown as vi.Mock).mockResolvedValueOnce({ id: 20, type: 'widget', name: 'NoPrice' })

    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/Type/i), 'widget')
    // leave price empty
    await user.click(screen.getByText('Save'))
    await screen.findByText(/Saving...|Save/)
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
    // ensure payload price was undefined
    const calledWith = mockCreate.mock.calls[0][0]
    expect(calledWith).toHaveProperty('type', 'widget')
    expect(calledWith.price).toBeUndefined()
  })

  it('cleans input on change (removes letters)', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement
    await user.type(priceInput, 'abc123,45xyz')
    // after typing, the input should contain only digits, comma and dot
    expect(priceInput.value).toMatch(/^[0-9.,]+$/)
  })

  it('Cancel button calls onClose', async () => {
    const onClose = vi.fn()
    const onCreated = vi.fn()
    render(<AddPopup isOpen={true} onClose={onClose} onCreated={onCreated} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})
