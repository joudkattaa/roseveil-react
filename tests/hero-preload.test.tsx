import { readFileSync } from 'node:fs'
import { screen, waitFor } from '@testing-library/react'
import { it, expect, vi } from 'vitest'
import App from '../src/App.tsx'
import { renderStorefront } from './renderStorefront.tsx'
import { products } from '../server/catalog.ts'

it.each([
  ['/shop', 'Shop ROSEVEIL'],
  ['/checkout', 'Demo Checkout'],
  ['/delay/3000', 'Shop ROSEVEIL'],
  ['/fail/500', 'Shop ROSEVEIL'],
  ['/empty', 'Shop ROSEVEIL'],
])(
  'does not preload Home artwork on a direct %s entry',
  async (path, title) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ items: products })),
    )
    expect(readFileSync('index.html', 'utf8')).not.toContain(
      'hero-ivory-classic',
    )
    renderStorefront(<App />, { initialEntries: [path] })
    await screen.findByRole('heading', { name: title, level: 1 })
    expect(document.querySelector('link[rel="preload"][as="image"]')).toBeNull()
    expect(document.querySelector('.hero-artwork')).toBeNull()
  },
)
it('preloads the original Home image with attributes matching the actual responsive image', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  renderStorefront(<App />)
  await waitFor(() =>
    expect(document.querySelector('.hero-image')).not.toBeNull(),
  )
  const image = document.querySelector('.hero-image')
  const preload = document.querySelector('link[rel="preload"][as="image"]')
  expect(preload).not.toBeNull()
  expect(preload).toHaveAttribute('href', image?.getAttribute('src'))
  expect(preload).toHaveAttribute('imagesrcset', image?.getAttribute('srcset'))
  expect(preload).toHaveAttribute('imagesizes', image?.getAttribute('sizes'))
  expect(preload).toHaveAttribute('type', 'image/jpeg')
  expect(preload).toHaveAttribute('fetchpriority', 'high')
})
