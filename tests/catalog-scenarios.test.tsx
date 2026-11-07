import { act, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, it, expect, vi } from 'vitest'
import App from '../src/App.tsx'
import { renderStorefront } from './renderStorefront.tsx'
import { products } from '../server/catalog.ts'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'

afterEach(() => window.history.replaceState(null, '', '/'))
function savedBag() {
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'body-cream', quantity: 2 }],
      promoCode: 'GLOW20',
    }),
  )
}
function enter(path: string) {
  window.history.replaceState(null, '', path)
  return renderStorefront(<App />, { initialEntries: [path] })
}
it('uses exact delay/3000 requests once under StrictMode and keeps navigation usable while loading', async () => {
  let finish: (response: Response) => void = () => {}
  const pending = new Promise<Response>((resolve) => {
    finish = resolve
  })
  const fetcher = vi.fn(
    (_input: RequestInfo | URL, _options?: RequestInit) => pending,
  )
  vi.stubGlobal('fetch', fetcher)
  const user = userEvent.setup()
  enter('/delay/3000')
  await screen.findByText(/Loading ROSEVEIL products/)
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(fetcher.mock.calls[0]?.[0]).toBe('/api/delay/3000')
  await user.click(screen.getByRole('link', { name: 'ABOUT US' }))
  await screen.findByRole('heading', { name: 'About ROSEVEIL', level: 1 })
  expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(false)
  await user.click(screen.getByRole('link', { name: 'SHOP' }))
  await screen.findByText(/Loading ROSEVEIL products/)
  await act(async () => finish(Response.json({ items: products })))
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  expect(fetcher).toHaveBeenCalledTimes(1)
})
it('uses fail/500 then retries the normal API while preserving the saved bag and shared controls', async () => {
  const fetcher = vi.fn(async (input: RequestInfo | URL) =>
    String(input) === '/api/fail/500'
      ? new Response('{}', { status: 500 })
      : Response.json({ items: products }),
  )
  vi.stubGlobal('fetch', fetcher)
  savedBag()
  const user = userEvent.setup()
  enter('/fail/500')
  await screen.findByText('Unable to load products. Please try again.')
  expect(screen.queryByText(/could not be displayed/)).not.toBeInTheDocument()
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(fetcher.mock.calls[0]?.[0]).toBe('/api/fail/500')
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Dark mode' }))
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  )
  expect(screen.getByRole('dialog')).toHaveTextContent('Your saved bag is safe')
  expect(screen.getByRole('button', { name: 'DEMO CHECKOUT' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Close dialog' }))
  await user.click(screen.getByRole('button', { name: 'Try Again' }))
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(fetcher.mock.calls[1]?.[0]).toBe('/api/products')
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain('GLOW20')
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  )
  expect(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'DEMO CHECKOUT',
    }),
  ).toBeEnabled()
})
it('shows helpful API-empty feedback rather than a search-no-match state and supports checking again', async () => {
  const fetcher = vi.fn(async (_input: RequestInfo | URL) =>
    Response.json({ items: [], total: 0 }),
  )
  vi.stubGlobal('fetch', fetcher)
  savedBag()
  const user = userEvent.setup()
  enter('/empty')
  await screen.findByRole('heading', {
    name: 'The collection is taking a little pause.',
  })
  expect(fetcher.mock.calls[0]?.[0]).toBe('/api/empty')
  expect(
    screen.queryByText('A little change of search?'),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  ).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Check Again' }))
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  expect(fetcher.mock.calls[1]?.[0]).toBe('/api/empty')
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toContain(
    'body-cream',
  )
})
it('keeps no-match filtering separate from an empty API response', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  const user = userEvent.setup()
  enter('/shop')
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  await user.click(
    screen.getByLabelText('Search products', { selector: 'summary' }),
  )
  await user.type(
    screen.getByLabelText('Search products', { selector: 'input' }),
    'zzzz-no-such-product',
  )
  await screen.findByText('A little change of search?')
  expect(
    screen.queryByText('The collection is taking a little pause.'),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'EXPLORE ALL PRODUCTS' }))
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
})
it('cancels scenario requests silently and permits a later retry without a duplicate request', async () => {
  const fetcher = vi
    .fn(
      (_input: RequestInfo | URL, _options?: RequestInit) =>
        new Promise<Response>(() => {}),
    )
    .mockResolvedValueOnce(Response.json({ items: products }))
  const store = createStorefrontAdapter({ scenario: '/delay/3000', fetcher })
  await store.actions.loadCatalog()
  const pending = store.actions.loadCatalog()
  expect(store.actions.loadCatalog()).toBe(pending)
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  store.cancelCatalog()
  await pending
  expect(store.getSnapshot()).toMatchObject({ phase: 'idle', error: null })
  fetcher.mockResolvedValueOnce(Response.json({ items: products }))
  await store.actions.loadCatalog()
  expect(store.getSnapshot().phase).toBe('ready')
  expect(fetcher).toHaveBeenCalledTimes(3)
})
