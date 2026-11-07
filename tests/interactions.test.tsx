import { StrictMode } from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import Dialog from '../src/shared/ui/Dialog.tsx'
import { products } from '../server/catalog.ts'

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function isSavedBag(value: unknown): value is {
  items: { id: string; quantity: number }[]
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    isUnknownArray(value.items) &&
    value.items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        'quantity' in item &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 99,
    )
  )
}

it('does not dismiss a dialog during StrictMode effect cleanup; restores focus', () => {
  const opener = document.createElement('button')
  document.body.append(opener)
  opener.focus()
  const close = vi.fn()
  const view = render(
    <StrictMode>
      <Dialog title="Test" onClose={close}>
        <p>Content</p>
      </Dialog>
    </StrictMode>,
  )
  expect(close).not.toHaveBeenCalled()
  fireEvent(
    screen.getByRole('dialog'),
    new Event('cancel', { cancelable: true }),
  )
  expect(close).toHaveBeenCalledTimes(1)
  view.unmount()
  expect(opener).toHaveFocus()
  opener.remove()
})

it('loads once in StrictMode, supports details/add/bag/promo/quantity/remove', async () => {
  const fetcher = vi.fn(async () => Response.json({ items: products }))
  vi.stubGlobal('fetch', fetcher)
  const user = userEvent.setup()
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  await user.click(
    await screen.findByRole('button', { name: 'View Velvet Body Cream' }),
  )
  expect(
    screen.getByRole('button', { name: 'Add Velvet Body Cream to bag' }),
  ).toBeEnabled()
  expect(fetcher).toHaveBeenCalledTimes(1)
  let dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getByRole('button', { name: 'ADD TO BAG' }))
  expect(within(dialog).getByRole('status')).toHaveTextContent(
    'added to your bag',
  )
  await user.click(within(dialog).getByRole('button', { name: 'Close dialog' }))
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
  )
  dialog = screen.getByRole('dialog')
  await user.type(
    within(dialog).getByLabelText('Have a little treat? Enter your code.'),
    ' glow20 ',
  )
  await user.click(within(dialog).getByRole('button', { name: 'APPLY' }))
  expect(within(dialog).getByText('GLOW20 · 20% off')).toBeInTheDocument()
  await user.click(
    within(dialog).getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  expect(
    within(dialog).getByLabelText('Quantity of Velvet Body Cream'),
  ).toHaveTextContent('2')
  expect(within(dialog).getByText('$50.73')).toBeInTheDocument()
  const saved: unknown = JSON.parse(
    localStorage.getItem('roseveil-shopping-bag-v1') ?? '{}',
  )
  if (!isSavedBag(saved)) throw new Error('Saved bag has an invalid shape.')
  expect(saved.items).toEqual([{ id: 'body-cream', quantity: 2 }])
  await user.click(within(dialog).getByRole('button', { name: 'REMOVE' }))
  expect(within(dialog).getByText('Discount removed.')).toBeInTheDocument()
  expect(within(dialog).queryByText('GLOW20 · 20% off')).not.toBeInTheDocument()
  await user.click(
    within(dialog).getByRole('button', { name: 'Remove Velvet Body Cream' }),
  )
  expect(
    within(dialog).getByText('Your next little luxury awaits.'),
  ).toBeInTheDocument()
})

it('synchronizes searches, resets filters, and recovers from API failure', async () => {
  let fail = true
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      fail
        ? new Response('{}', { status: 500 })
        : Response.json({ items: products }),
    ),
  )
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('button', { name: 'Try Again' })
  fail = false
  await user.click(screen.getByRole('button', { name: 'Try Again' }))
  await screen.findByRole('button', { name: 'View Velvet Body Cream' })
  await user.click(
    screen.getByLabelText('Search products', { selector: 'button' }),
  )
  await user.type(
    screen.getByLabelText('Find your everyday beauty essential'),
    'SERUM',
  )
  expect(
    screen.getByLabelText('Search products', { selector: 'input' }),
  ).toHaveValue('SERUM')
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'View Velvet Body Cream' }),
    ).not.toBeInTheDocument(),
  )
  await user.click(screen.getByRole('button', { name: /Clear filters/ }))
  expect(
    screen.getByLabelText('Find your everyday beauty essential'),
  ).toHaveValue('')
})

it('reports clipboard failure explicitly instead of implying copy success', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(Error('denied')) },
  })
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /GLOW20/ }))
  await waitFor(() =>
    expect(screen.getByText(/Could not copy/)).toBeInTheDocument(),
  )
})
