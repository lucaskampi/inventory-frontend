import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect } from 'vitest'
import Cards from './Cards'

test('renders empty cards state', () => {
  render(<Cards entities={[]} />)

  // Total Entities card shows 0
  const totalLabel = screen.getByText(/Total Entities/i)
  const totalCard = totalLabel.closest('div.bg-slate-800') || totalLabel.parentElement!
  expect(within(totalCard).getByText('0')).toBeInTheDocument()

  // Low stock shows None and count 0
  const lowLabel = screen.getByText(/Low Stock Entities/i)
  const lowCard = lowLabel.closest('div.bg-slate-800') || lowLabel.parentElement!.parentElement!.parentElement!
  expect(within(lowCard).getByText('0')).toBeInTheDocument()
  expect(within(lowCard).getByText(/None/i) || screen.getByText(/None/i)).toBeTruthy()
})

test('calculates totals, low stock and opens ViewAll modal', async () => {
  const now = new Date().toISOString()
  const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString() // 40 days ago
  const entities = [
    { id: 1, type: 'widget', name: 'A', price: '10.5', quantity: '2', created_at: now },
    { id: 2, type: 'widget', name: 'B', price: 5, stock: 3, created_at: old },
    { id: 3, type: 'gadget', name: 'C', price: 'bad', created_at: undefined },
  ]

  render(<Cards entities={entities} lowStockThreshold={5} currency="USD" />)

  // Total Entities should show 3
  const totalLabel = screen.getByText(/Total Entities/i)
  const totalCard = totalLabel.closest('div.bg-slate-800') || totalLabel.parentElement!
  expect(within(totalCard).getByText('3')).toBeInTheDocument()

  // Low stock types count
  const lowLabel = screen.getByText(/Low Stock Entities/i)
  const lowCard = lowLabel.closest('div.bg-slate-800') || lowLabel.parentElement!.parentElement!.parentElement!
  expect(within(lowCard).getByText('2')).toBeInTheDocument()

  // Inventory Value should include 36 (10.5*2 + 5*3)
  const valueLabel = screen.getByText(/Inventory Value/i)
  const valueCard = valueLabel.closest('div.bg-slate-800') || valueLabel.parentElement!
  expect(within(valueCard).getByText(/36/)).toBeInTheDocument()

  // Items added (30d) should be 1
  const addedLabel = screen.getByText(/Items Added \(30d\)/i)
  const addedCard = addedLabel.closest('div.bg-slate-800') || addedLabel.parentElement!
  expect(within(addedCard).getByText('1')).toBeInTheDocument()

  // View All button should appear and open modal listing 'A'
  const viewBtn = within(lowCard).getByRole('button', { name: /View All/i })
  await userEvent.click(viewBtn)
  expect(await screen.findByText('A')).toBeInTheDocument()
})
