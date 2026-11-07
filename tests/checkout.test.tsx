import { renderStorefront } from './renderStorefront.tsx'
import { StrictMode } from 'react'
import { act, fireEvent, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { products } from '../server/catalog.ts'
import { useStorefront } from '../src/features/storefront/useStorefront.ts'
import { useLocation } from 'react-router'

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
  await screen.findByRole('heading', { name: 'Demo Checkout', level: 1 })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  return within(screen.getByRole('main'))
}

it('does not offer checkout for an empty bag', async () => {
  setupCatalog()
  const user = userEvent.setup()
  renderStorefront(<App />)
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

it('uses schema validation, confirms only valid input, clears the cart and never sends customer details', async () => {
  const fetcher = setupCatalog()
  savedBag()
  const user = userEvent.setup()
  renderStorefront(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  const checkout = await openCheckout(user)
  expect(
    checkout.getByRole('heading', { name: 'Demo Checkout', level: 1 }),
  ).toHaveFocus()
  const form = checkout.getByRole('form', { name: 'Demo checkout' })
  expect(form).toHaveAttribute('novalidate')
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
  await waitFor(() =>
    expect(checkout.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    ),
  )
  await user.click(checkout.getByRole('button', { name: 'Confirm demo order' }))
  expect(screen.queryByText('Demo order confirmed')).not.toBeInTheDocument()
  await user.clear(checkout.getByLabelText('Email'))
  await user.type(checkout.getByLabelText('Email'), 'demo@example.com')
  await waitFor(() =>
    expect(checkout.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'false',
    ),
  )
  const summary = checkout.getByRole('region', { name: 'Order summary' })
  expect(summary).toHaveTextContent('Quantity: 2')
  expect(summary).toHaveTextContent('GLOW20 discount$11.20')
  expect(summary).toHaveTextContent('Subtotal$55.98')
  expect(summary).toHaveTextContent('Final total$50.73')
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain(
    'body-cream',
  )
  await user.click(checkout.getByRole('button', { name: 'Confirm demo order' }))
  await screen.findByRole('heading', { name: 'Demo order confirmed' })
  const confirmation = within(screen.getByRole('main'))
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

it('goes back to the bag page, discards entered details and preserves the bag when leaving checkout', async () => {
  setupCatalog()
  savedBag()
  const user = userEvent.setup()
  renderStorefront(<App />)
  let checkout = await openCheckout(user)
  await user.type(checkout.getByLabelText('Full name'), 'Temporary Name')
  await user.click(
    checkout.getByRole('button', { name: 'Back to shopping bag' }),
  )
  await screen.findByRole('heading', { name: 'Your Shopping Bag', level: 1 })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await user.click(
    screen.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  await user.click(screen.getByRole('button', { name: 'DEMO CHECKOUT' }))
  await screen.findByRole('heading', { name: 'Demo Checkout', level: 1 })
  checkout = within(screen.getByRole('main'))
  expect(checkout.getByLabelText('Full name')).toHaveValue('')
  expect(
    checkout.getByRole('region', { name: 'Order summary' }),
  ).toHaveTextContent('Quantity: 3')
  await user.click(screen.getByRole('link', { name: 'SHOP' }))
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 3 items' }),
  ).toBeInTheDocument()
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
  renderStorefront(<App />)
  await screen.findByRole('button', { name: 'Try Again' })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  )
  expect(screen.getByRole('button', { name: 'DEMO CHECKOUT' })).toBeDisabled()
})

interface StoreControlsProps {
  onReload: boolean
}
function StoreControls({ onReload }: StoreControlsProps) {
  const { actions } = useStorefront()
  const { pathname } = useLocation()
  return (
    <>
      <output aria-label="Checkout route">{pathname}</output>
      <button
        onClick={() => {
          if (onReload) void actions.loadCatalog()
          else actions.changeQuantity('body-cream', 1)
        }}
      >
        Change shared cart
      </button>
    </>
  )
}
async function fillCustomer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Demo Customer')
  await user.type(screen.getByLabelText('Email'), 'demo@example.com')
  await user.type(screen.getByLabelText('Phone number'), '1234567890')
  await user.type(
    screen.getByLabelText('Shipping address'),
    '123 Sample Street',
  )
}
it('rechecks current catalog readiness after schema validation and preserves an unavailable bag', async () => {
  let failing = false
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      failing
        ? new Response('{}', { status: 500 })
        : Response.json({ items: products }),
    ),
  )
  savedBag()
  const user = userEvent.setup()
  renderStorefront(
    <>
      <App />
      <StoreControls onReload />
    </>,
    { initialEntries: ['/shop'] },
  )
  await openCheckout(user)
  expect(screen.getByLabelText('Checkout route')).toHaveTextContent('/checkout')
  await fillCustomer(user)
  failing = true
  act(() => {
    fireEvent.submit(screen.getByRole('form', { name: 'Demo checkout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Change shared cart' }))
  })
  await screen.findByText(/Checkout is unavailable/)
  expect(screen.queryByText('Demo order confirmed')).not.toBeInTheDocument()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain(
    'body-cream',
  )
})
it('uses the latest quantities when the cart changes during async schema validation', async () => {
  setupCatalog()
  savedBag()
  const user = userEvent.setup()
  renderStorefront(
    <>
      <App />
      <StoreControls onReload={false} />
    </>,
    { initialEntries: ['/checkout'] },
  )
  await screen.findByLabelText('Full name')
  await screen.findByText('Final total')
  await fillCustomer(user)
  act(() => {
    fireEvent.submit(screen.getByRole('form', { name: 'Demo checkout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Change shared cart' }))
  })
  await screen.findByRole('heading', { name: 'Demo order confirmed' })
  expect(
    screen.getByRole('region', { name: 'Order summary' }),
  ).toHaveTextContent('Quantity: 3')
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  ).toBeInTheDocument()
})
