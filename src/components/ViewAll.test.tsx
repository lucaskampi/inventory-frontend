import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, test, expect } from 'vitest'

import ViewAll from './ViewAll'

test('renders empty state and close button works', async () => {
  const onClose = vi.fn()
  render(<ViewAll items={[]} onClose={onClose} />)
  expect(screen.getByText(/No low stock items/i)).toBeInTheDocument()
  await userEvent.click(screen.getByText(/Close/i))
  expect(onClose).toHaveBeenCalled()
})

test('renders items and reorder toggles to Reordered', async () => {
  const onClose = vi.fn()
  const items = [{ id: 1, name: 'Widget A', type: 'widget', qty: 2 }]
  render(<ViewAll items={items} onClose={onClose} />)
  expect(screen.getByText('Widget A')).toBeInTheDocument()
  const btn = screen.getByRole('button', { name: /Reorder/i })
  await userEvent.click(btn)
  expect(await screen.findByText(/Reordered/i)).toBeInTheDocument()
})
