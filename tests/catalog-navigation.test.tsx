import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, vi } from 'vitest'
import { useLocation, useNavigate } from 'react-router'
import App from '../src/App.tsx'
import { products } from '../server/catalog.ts'
import { renderStorefront } from './renderStorefront.tsx'
function History() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output aria-label="Current route">{location.pathname}</output>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  )
}
it('filters Home locally, resets categories, opens all Shop products and supports history', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  const user = userEvent.setup()
  renderStorefront(
    <>
      <App />
      <History />
    </>,
  )
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  const categories = screen.getByRole('region', {
    name: 'Find Your Everyday Ritual',
  })
  await user.click(
    within(categories).getByRole('button', { name: /Body Care/ }),
  )
  expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/)
  expect(
    within(categories).getByRole('button', { name: /Body Care/ }),
  ).toHaveAttribute('aria-pressed', 'true')
  let collection = screen.getByRole('region', { name: 'Body Care' })
  expect(
    within(collection).getAllByRole('button', { name: /^Add / }),
  ).toHaveLength(products.filter((p) => p.category === 'Body Care').length)
  await user.click(
    within(categories).getByRole('button', { name: /Fragrance/ }),
  )
  collection = screen.getByRole('region', { name: 'Fragrance' })
  expect(
    within(collection).getAllByRole('button', { name: /^Add / }),
  ).toHaveLength(products.filter((p) => p.category === 'Fragrance').length)
  await user.click(screen.getByRole('button', { name: /Clear filters/ }))
  expect(screen.getAllByRole('button', { name: /^Add / })).toHaveLength(
    products.length,
  )
  await user.click(
    within(categories).getByRole('button', { name: /Body Care/ }),
  )
  await user.click(screen.getByRole('link', { name: 'VIEW ALL PRODUCTS' }))
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL' })
  expect(screen.getByLabelText('Current route')).toHaveTextContent('/shop')
  expect(screen.getAllByRole('button', { name: /^Add / })).toHaveLength(
    products.length,
  )
  await user.click(screen.getByRole('button', { name: 'Back' }))
  await screen.findByRole('heading', { name: 'Find Your Everyday Ritual' })
  expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/)
  expect(
    within(
      screen.getByRole('region', { name: 'Find Your Everyday Ritual' }),
    ).getByRole('button', { name: /Body Care/ }),
  ).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Forward' }))
  await screen.findByRole('heading', { name: 'Shop ROSEVEIL' })
  expect(screen.getAllByRole('button', { name: /^Add / })).toHaveLength(
    products.length,
  )
})
it('opens Shop with every product on a direct visit', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  renderStorefront(<App />, { initialEntries: ['/shop'] })
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  expect(screen.getAllByRole('button', { name: /^Add / })).toHaveLength(
    products.length,
  )
})

it('uses static scrolling for Home category selection with reduced motion', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  const user = userEvent.setup()
  renderStorefront(<App />)
  await screen.findByRole('link', { name: 'View Velvet Body Cream' })
  const previous = window.matchMedia
  window.matchMedia = vi.fn((query) => ({
    ...previous(query),
    matches: query.includes('prefers-reduced-motion'),
  }))
  try {
    vi.mocked(HTMLElement.prototype.scrollIntoView).mockClear()
    await user.click(
      within(
        screen.getByRole('region', { name: 'Find Your Everyday Ritual' }),
      ).getByRole('button', { name: /Fragrance/ }),
    )
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    })
  } finally {
    window.matchMedia = previous
  }
})
