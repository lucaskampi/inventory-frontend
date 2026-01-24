import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect, vi, beforeEach } from 'vitest'

// Mock API module
vi.mock('../api/entities', () => ({
  listEntities: vi.fn(),
  deleteEntity: vi.fn(),
}))

// Stub AddPopup to allow invoking `onCreated` when opened, and stub EditPopup to show when opened
vi.mock('../components/AddPopup', () => ({
  default: ({ isOpen, onCreated }: any) => (isOpen ? <div data-testid="stub-add" onClick={() => onCreated({ id: 999, name: 'New', type: 't' })}>stub-add</div> : null),
}))
vi.mock('../components/EditPopup', () => ({
  default: ({ isOpen, onSaved }: any) => (isOpen ? <div data-testid="stub-edit" onClick={() => onSaved?.({ id: 777, name: 'SavedX', type: 't' })}>stub-edit</div> : null),
}))

import Home from './Home'
import { listEntities, deleteEntity } from '../api/entities'

beforeEach(() => {
  vi.clearAllMocks()
})

test('initial fetch and renders Entities header', async () => {
  ;(listEntities as any).mockResolvedValueOnce([])
  render(<Home />)
  expect(await screen.findByText('Entities')).toBeInTheDocument()
  expect(listEntities).toHaveBeenCalledTimes(1)
})

test('shows loading state while fetching and then displays results', async () => {
  let resolve: (v: any) => void
  const p = new Promise((res) => { resolve = res })
  ;(listEntities as any).mockReturnValueOnce(p)
  render(<Home />)
  // Table should show Loading... while promise unresolved
  expect(await screen.findByText(/Loading.../i)).toBeInTheDocument()
  // Home-level spinner (role=status) should be present while loading
  expect(screen.getByRole('status', { name: 'home-loading' })).toBeInTheDocument()
  // resolve with data
  resolve!([{ id: 1, name: 'X', type: 't', description: '' }])
  expect(await screen.findByText('X')).toBeInTheDocument()
})

test('shows error when fetch fails and retry (Refresh) reloads', async () => {
  ;(listEntities as any).mockRejectedValueOnce(new Error('fetch-fail'))
  render(<Home />)
  expect(await screen.findByText(/fetch-fail/)).toBeInTheDocument()
  // prepare successful retry
  ;(listEntities as any).mockResolvedValueOnce([{ id: 2, name: 'Y', type: 't', description: '' }])
  const user = userEvent.setup()
  await user.click(screen.getByTitle('Refresh'))
  expect(await screen.findByText('Y')).toBeInTheDocument()
})

test('delete flow: confirm true deletes and removes entity; confirm false does nothing', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 3, name: 'DelMe', type: 't', description: '' }])
  ;(deleteEntity as any).mockResolvedValue(undefined)
  render(<Home />)
  expect(await screen.findByText('DelMe')).toBeInTheDocument()
  const user = userEvent.setup()

  // open confirm dialog and cancel -> no delete
  await user.click(screen.getByTitle('Delete'))
  expect(await screen.findByTestId('confirm-dialog')).toBeInTheDocument()
  await user.click(screen.getByText('Cancel'))
  expect(deleteEntity).not.toHaveBeenCalled()

  // open confirm dialog and confirm -> delete should be called and UI updated
  await user.click(screen.getByTitle('Delete'))
  expect(await screen.findByTestId('confirm-dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Confirm' }))
  expect(deleteEntity).toHaveBeenCalledWith(3)
  // after deletion, item should be removed
  expect(screen.queryByText('DelMe')).not.toBeInTheDocument()
})

test('clicking Add opens AddPopup and onCreated updates list', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 4, name: 'Old', type: 't', description: '' }])
  render(<Home />)
  expect(await screen.findByText('Old')).toBeInTheDocument()
  const user = userEvent.setup()
  // open Add popup via button in Table
  await user.click(screen.getByTitle('Add'))
  // our stub AddPopup exposes a clickable test node; trigger its onCreated
  await user.click(screen.getByTestId('stub-add'))
  expect(await screen.findByText('New')).toBeInTheDocument()
})

test('clicking Edit opens EditPopup', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 5, name: 'E1', type: 't', description: '' }])
  render(<Home />)
  expect(await screen.findByText('E1')).toBeInTheDocument()
  const user = userEvent.setup()
  await user.click(screen.getByTitle('Edit'))
  expect(screen.getByTestId('stub-edit')).toBeInTheDocument()
})

test('onSaved with unknown id inserts entity at top', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 6, name: 'Before', type: 't', description: '' }])
  render(<Home />)
  expect(await screen.findByText('Before')).toBeInTheDocument()
  const user = userEvent.setup()
  // open edit which will render stub-edit; clicking it triggers onSaved
  await user.click(screen.getByTitle('Edit'))
  await user.click(screen.getByTestId('stub-edit'))
  // new item from onSaved should be present
  expect(await screen.findByText('SavedX')).toBeInTheDocument()
})

test('onSaved with existing id replaces the entity and closes edit popup', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 777, name: 'Before', type: 't', description: '' }])
  render(<Home />)
  expect(await screen.findByText('Before')).toBeInTheDocument()
  const user = userEvent.setup()
  // clicking Edit triggers stub-edit which calls onSaved with id 777
  await user.click(screen.getByTitle('Edit'))
  // click the stub-edit element to trigger onSaved, then assert replacement
  await user.click(screen.getByTestId('stub-edit'))
  expect(await screen.findByText('SavedX')).toBeInTheDocument()
  // original should no longer be present
  expect(screen.queryByText('Before')).not.toBeInTheDocument()
  // edit popup should be closed (stub-edit not rendered)
  expect(screen.queryByTestId('stub-edit')).not.toBeInTheDocument()
})

test('onCreated inserts new entity at top of list', async () => {
  ;(listEntities as any).mockResolvedValueOnce([
    { id: 4, name: 'Old', type: 't', description: '' },
    { id: 5, name: 'Older', type: 't', description: '' },
  ])
  const { container } = render(<Home />)
  expect(await screen.findByText('Old')).toBeInTheDocument()
  const user = userEvent.setup()
  await user.click(screen.getByTitle('Add'))
  // trigger onCreated via stub
  await user.click(screen.getByTestId('stub-add'))
  // new item should be present
  expect(await screen.findByText('New')).toBeInTheDocument()
  // verify new item is at top of table rows
  const rows = container.querySelectorAll('tbody tr')
  expect(rows.length).toBeGreaterThan(0)
  const firstCell = rows[0].querySelector('td')
  expect(firstCell?.textContent).toContain('New')
})

test('delete error branch displays error message', async () => {
  ;(listEntities as any).mockResolvedValueOnce([{ id: 8, name: 'ToDelete', type: 't', description: '' }])
  ;(deleteEntity as any).mockRejectedValueOnce(new Error('delete-fail'))
  render(<Home />)
  expect(await screen.findByText('ToDelete')).toBeInTheDocument()
  const user = userEvent.setup()
  // open confirm dialog and confirm -> triggers delete error
  await user.click(screen.getByTitle('Delete'))
  expect(await screen.findByTestId('confirm-dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Confirm' }))
  expect(await screen.findByText(/delete-fail/)).toBeInTheDocument()
})
