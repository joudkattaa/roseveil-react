import { act, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { renderStorefront } from './renderStorefront.tsx'
import { products } from '../server/catalog.ts'

const gate = vi.hoisted(() => {
  let resolve = () => {}
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { resolve, promise, loaded: vi.fn() }
})
vi.mock('../src/pages/AboutPage.tsx', async () => {
  gate.loaded()
  await gate.promise
  return { default: () => <h1>Delayed About content</h1> }
})

it('loads a page only when opened and keeps Header/Footer visible during Suspense', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  const home = renderStorefront(<App />)
  await screen.findByRole('heading', { name: /A softer kind/ })
  expect(gate.loaded).not.toHaveBeenCalled()
  home.unmount()
  renderStorefront(<App />, { initialEntries: ['/about'] })
  await waitFor(() =>
    expect(screen.getByText('Loading page...')).toBeInTheDocument(),
  )
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  expect(gate.loaded).toHaveBeenCalledTimes(1)
  await act(async () => {
    gate.resolve()
    await gate.promise
  })
  expect(
    await screen.findByRole('heading', { name: 'Delayed About content' }),
  ).toBeInTheDocument()
})
