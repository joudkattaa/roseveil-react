import { BrowserRouter } from 'react-router'
import { render } from '@testing-library/react'
import StorefrontProvider from '../src/features/storefront/StorefrontProvider.tsx'
import { useNavigate } from 'react-router'
import { renderHook, act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { renderStorefront } from './renderStorefront.tsx'
import { useProductDetails } from '../src/features/catalog/useProductDetails.ts'
import { products } from '../server/catalog.ts'

function catalog() {
  const fetcher = vi.fn(
    async (input: RequestInfo | URL, _options?: RequestInit) => {
      const path = String(input)
      if (!path.startsWith('/api/products/'))
        return Response.json({ items: products })
      const product = products.find((p) => p.id === path.split('/').at(-1))
      return product
        ? Response.json(product)
        : new Response('{}', { status: 404 })
    },
  )
  vi.stubGlobal('fetch', fetcher)
  return fetcher
}

it.each([
  ['/shop', 'Shop ROSEVEIL'],
  ['/about', 'About ROSEVEIL'],
  ['/bag', 'Your Shopping Bag'],
  ['/checkout', 'Demo Checkout'],
  ['/does-not-exist', 'Page not found'],
  ['/products', 'Product Details'],
])(
  'opens direct URL %s with its shared layout and page title',
  async (path, title) => {
    catalog()
    renderStorefront(<App />, { initialEntries: [path] })
    const heading = await screen.findByRole('heading', {
      name: title,
      level: 1,
    })
    expect(document.title).toContain(title)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect([heading, document.getElementById('main')]).toContain(
      document.activeElement,
    )
  },
)

it('fetches details by ID and shares the same cart across product, About, bag and checkout routes', async () => {
  const fetcher = catalog()
  const user = userEvent.setup()
  renderStorefront(<App />, { initialEntries: ['/products/body-cream'] })
  await user.click(await screen.findByRole('button', { name: 'ADD TO BAG' }))
  expect(
    fetcher.mock.calls.some(
      ([input]) => String(input) === '/api/products/body-cream',
    ),
  ).toBe(true)
  await user.click(screen.getByRole('link', { name: 'ABOUT US' }))
  await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
  ).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Shopping Bag' }))
  await screen.findByRole('heading', { name: 'Your Shopping Bag', level: 1 })
  await user.click(
    screen.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  ).toBeInTheDocument()
  await user.type(
    screen.getByLabelText('Have a little treat? Enter your code.'),
    'GLOW20',
  )
  await user.click(screen.getByRole('button', { name: 'APPLY' }))
  await user.click(screen.getByRole('button', { name: 'DEMO CHECKOUT' }))
  await screen.findByRole('heading', { name: 'Demo Checkout', level: 1 })
  expect(
    screen.getByRole('region', { name: 'Order summary' }),
  ).toHaveTextContent('Final total$50.73')
  await user.type(screen.getByLabelText('Full name'), 'Demo Customer')
  await user.type(screen.getByLabelText('Email'), 'demo@example.com')
  await user.type(screen.getByLabelText('Phone number'), '1234567890')
  await user.type(
    screen.getByLabelText('Shipping address'),
    '123 Sample Street',
  )
  await user.click(screen.getByRole('button', { name: 'Confirm demo order' }))
  expect(
    screen.getByRole('heading', { name: 'Demo order confirmed' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toBe(
    JSON.stringify({ items: [], promoCode: '' }),
  )
})

interface HistoryControlProps {
  step: number
}
function HistoryControl({ step }: HistoryControlProps) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(step)}>{'History ' + step}</button>
}

it('supports navigation, Back and Forward while retaining one catalog request', async () => {
  const fetcher = catalog()
  const user = userEvent.setup()
  renderStorefront(
    <>
      <HistoryControl step={-1} />
      <HistoryControl step={1} />
      <App />
    </>,
  )
  await screen.findByRole('heading', { name: /A softer kind/ })
  await user.click(screen.getByRole('link', { name: 'SHOP' }))
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
  await user.click(screen.getByRole('link', { name: 'ABOUT US' }))
  await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
  await user.click(screen.getByRole('button', { name: 'History -1' }))
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
  await user.click(screen.getByRole('button', { name: 'History 1' }))
  await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
  expect(
    fetcher.mock.calls.filter(([input]) => String(input) === '/api/products'),
  ).toHaveLength(1)
})

it('handles missing and invalid product IDs without showing a misleading Add control', async () => {
  const fetcher = catalog()
  const view = renderStorefront(<App />, {
    initialEntries: ['/products/missing-product'],
  })
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Product not found.',
  )
  expect(
    screen.queryByRole('button', { name: 'ADD TO BAG' }),
  ).not.toBeInTheDocument()
  view.unmount()
  renderStorefront(<App />, { initialEntries: ['/products/%25invalid'] })
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid product ID.',
  )
  expect(
    fetcher.mock.calls.some(([input]) => String(input).includes('%25invalid')),
  ).toBe(false)
})

it('shows product loading, retries a real failure and recovers', async () => {
  let fail = true
  const fetcher = catalog()
  fetcher.mockImplementation(async (input) =>
    String(input).startsWith('/api/products/')
      ? fail
        ? new Response('{}', { status: 500 })
        : Response.json(products.find((p) => p.id === 'serum'))
      : Response.json({ items: products }),
  )
  const user = userEvent.setup()
  renderStorefront(<App />, { initialEntries: ['/products/serum'] })
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load this product.',
  )
  fail = false
  await user.click(screen.getByRole('button', { name: 'Try Again' }))
  expect(
    await screen.findByRole('button', { name: 'ADD TO BAG' }),
  ).toBeEnabled()
})

it('aborts obsolete detail requests on id changes and unmount, ignoring late data', async () => {
  let resolveOld: (response: Response) => void = () => {}
  const old = new Promise<Response>((resolve) => {
    resolveOld = resolve
  })
  const fetcher = vi.fn((input: RequestInfo | URL, _options?: RequestInit) =>
    String(input).endsWith('/serum')
      ? old
      : Promise.resolve(
          Response.json(products.find((p) => p.id === 'shampoo')),
        ),
  )
  vi.stubGlobal('fetch', fetcher)
  const { result, rerender, unmount } = renderHook(
    ({ id }) => useProductDetails(id),
    { initialProps: { id: 'serum' } },
  )
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
  const signal = fetcher.mock.calls[0]?.[1]?.signal
  expect(result.current.state.phase).toBe('loading')
  rerender({ id: 'shampoo' })
  expect(signal?.aborted).toBe(true)
  await waitFor(() => expect(result.current.state.phase).toBe('ready'))
  await act(async () => {
    resolveOld(Response.json(products.find((p) => p.id === 'serum')))
    await Promise.resolve()
  })
  expect(
    'product' in result.current.state ? result.current.state.product?.id : '',
  ).toBe('shampoo')
  const currentSignal = fetcher.mock.calls[1]?.[1]?.signal
  unmount()
  expect(currentSignal?.aborted).toBe(true)
})

it('reads direct browser URLs and restores saved bag data after a refresh-equivalent remount', async () => {
  catalog()
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'serum', quantity: 1 }],
      promoCode: 'GLOW20',
    }),
  )
  window.history.replaceState(null, '', '/shop')
  const first = render(
    <StorefrontProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StorefrontProvider>,
  )
  try {
    await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
    expect(
      screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
    ).toBeInTheDocument()
    act(() => {
      window.history.pushState(null, '', '/about')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
    first.unmount()
    const refreshed = render(
      <StorefrontProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StorefrontProvider>,
    )
    await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
    expect(
      screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
    ).toBeInTheDocument()
    refreshed.unmount()
  } finally {
    first.unmount()
    window.history.replaceState(null, '', '/')
  }
})

it('closes quick-bag dialogs on route changes and avoids duplicate bag forms on the bag page', async () => {
  catalog()
  const user = userEvent.setup()
  renderStorefront(
    <>
      <HistoryControl step={-1} />
      <App />
    </>,
    { initialEntries: ['/bag', '/shop'] },
  )
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  )
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'History -1' }))
  await screen.findByRole('heading', { name: 'Your Shopping Bag', level: 1 })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.querySelectorAll('#cart-content')).toHaveLength(1)
})
