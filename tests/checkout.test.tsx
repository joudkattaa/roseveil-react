import { StrictMode } from 'react'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { products } from '../server/catalog.ts'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'
import { useShoppingBag } from '../src/features/cart/useShoppingBag.ts'

function setupCatalog() {
  const fetcher = vi.fn(async () => Response.json({ items: products }))
  vi.stubGlobal('fetch', fetcher)
  return fetcher
}
function savedBag() {
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'body-cream', quantity: 2 }],
      promoCode: 'GLOW20',
    }),
  )
}
async function openCheckout(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('button', { name: 'Add Velvet Body Cream to bag' })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  )
  await user.click(screen.getByRole('button', { name: 'DEMO CHECKOUT' }))
  return within(screen.getByRole('dialog', { name: 'Demo Checkout' }))
}

it('does not offer checkout for an empty bag', async () => {
  setupCatalog()
  const user = userEvent.setup()
  render(<App />)
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  )
  expect(
    screen.getByText('Your next little luxury awaits.'),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'DEMO CHECKOUT' }),
  ).not.toBeInTheDocument()
})

it('uses native validation, confirms only valid input, clears the cart and never sends customer details', async () => {
  const fetcher = setupCatalog()
  savedBag()
  const user = userEvent.setup()
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  const checkout = await openCheckout(user)
  expect(
    checkout.getByRole('heading', { name: 'Customer information' }),
  ).toHaveFocus()
  const form = checkout.getByRole('form', { name: 'Demo checkout' })
  expect(form).toBeInvalid()
  await user.click(checkout.getByRole('button', { name: 'Confirm demo order' }))
  expect(screen.queryByText('Demo order confirmed')).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  ).toBeInTheDocument()
  await user.type(checkout.getByLabelText('Full name'), 'Demo Customer')
  await user.type(checkout.getByLabelText('Email'), 'not-an-email')
  await user.type(checkout.getByLabelText('Phone number'), '1234567890')
  await user.type(
    checkout.getByLabelText('Shipping address'),
    '123 Sample Street',
  )
  expect(checkout.getByLabelText('Email')).toBeInvalid()
  await user.click(checkout.getByRole('button', { name: 'Confirm demo order' }))
  expect(screen.queryByText('Demo order confirmed')).not.toBeInTheDocument()
  await user.clear(checkout.getByLabelText('Email'))
  await user.type(checkout.getByLabelText('Email'), 'demo@example.com')
  expect(form).toBeValid()
  const summary = checkout.getByRole('region', { name: 'Order summary' })
  expect(summary).toHaveTextContent('Quantity: 2')
  expect(summary).toHaveTextContent('GLOW20 discount$11.20')
  expect(summary).toHaveTextContent('Subtotal$55.98')
  expect(summary).toHaveTextContent('Final total$50.73')
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain(
    'body-cream',
  )
  await user.click(checkout.getByRole('button', { name: 'Confirm demo order' }))
  const confirmation = within(
    screen.getByRole('dialog', { name: 'Demo Confirmation' }),
  )
  expect(
    confirmation.getByRole('heading', { name: 'Demo order confirmed' }),
  ).toHaveFocus()
  expect(confirmation.getByText(/No payment was collected/)).toBeInTheDocument()
  expect(
    confirmation.getByRole('region', { name: 'Order summary' }),
  ).toHaveTextContent('Final total$50.73')
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toBe(
    JSON.stringify({ items: [], promoCode: '' }),
  )
  expect(fetcher).toHaveBeenCalledTimes(1)
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index)
    expect(key ? localStorage.getItem(key) : '').not.toMatch(
      /demo@example.com|Demo Customer|123 Sample Street|1234567890/,
    )
  }
  await user.click(
    confirmation.getByRole('button', { name: 'Continue shopping' }),
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('goes back to edit the bag, discards entered details and preserves the bag when dismissed', async () => {
  setupCatalog()
  savedBag()
  const user = userEvent.setup()
  render(<App />)
  let checkout = await openCheckout(user)
  await user.type(checkout.getByLabelText('Full name'), 'Temporary Name')
  await user.click(
    checkout.getByRole('button', { name: 'Back to shopping bag' }),
  )
  expect(
    screen.getByRole('group', { name: 'Shopping bag contents' }),
  ).toHaveFocus()
  await user.click(
    screen.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  await user.click(screen.getByRole('button', { name: 'DEMO CHECKOUT' }))
  checkout = within(screen.getByRole('dialog', { name: 'Demo Checkout' }))
  expect(checkout.getByLabelText('Full name')).toHaveValue('')
  expect(
    checkout.getByRole('region', { name: 'Order summary' }),
  ).toHaveTextContent('Quantity: 3')
  fireEvent(
    screen.getByRole('dialog'),
    new Event('cancel', { cancelable: true }),
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 3 items' }),
  ).toHaveFocus()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain(
    'body-cream',
  )
})

it('blocks checkout while saved bag prices are unavailable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status: 500 })),
  )
  savedBag()
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('button', { name: 'Try Again' })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  )
  expect(screen.getByRole('button', { name: 'DEMO CHECKOUT' })).toBeDisabled()
})

it('rechecks catalog readiness at confirmation and does not clear an invalid bag', async () => {
  const store = createStorefrontAdapter({
    fetcher: async () => Response.json({ items: products }),
  })
  await store.actions.loadCatalog()
  store.actions.addProduct('body-cream')
  const clearCart = vi.fn()
  const actions = { ...store.actions, clearCart }
  const ready = store.getSnapshot()
  const { result, rerender } = renderHook(
    ({ snapshot }) =>
      useShoppingBag(snapshot, actions, vi.fn(), { current: null }),
    { initialProps: { snapshot: ready } },
  )
  act(() => result.current.beginCheckout())
  expect(result.current.activeDialog?.kind).toBe('checkout')
  rerender({ snapshot: { ...ready, phase: 'error' } })
  act(() => result.current.confirmCheckout())
  expect(clearCart).not.toHaveBeenCalled()
  expect(result.current.activeDialog?.kind).toBe('checkout')
})
