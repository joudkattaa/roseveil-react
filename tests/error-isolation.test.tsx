import { lazy, Suspense, type ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { it, expect, vi } from 'vitest'
import App from '../src/App.tsx'
import LazyPage from '../src/shared/ui/LazyPage.tsx'
import { renderStorefront } from './renderStorefront.tsx'
import { products } from '../server/catalog.ts'
const faults = vi.hoisted(() => ({ catalog: false, about: false }))
vi.mock(
  '../src/features/catalog/CatalogSection.tsx',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../src/features/catalog/CatalogSection.tsx')
      >()
    return {
      default: function CatalogFailure(
        props: ComponentProps<typeof actual.default>,
      ) {
        if (faults.catalog) throw Error('Reproduced catalog render error')
        return <actual.default {...props} />
      },
    }
  },
)
vi.mock('../src/pages/AboutPage.tsx', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../src/pages/AboutPage.tsx')>()
  return {
    default: function AboutFailure() {
      if (faults.about) throw Error('Reproduced page render error')
      return <actual.default />
    },
  }
})
it('isolates a collection render failure and retries without refetching or breaking bag/theme', async () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  const fetcher = vi.fn(async () => Response.json({ items: products }))
  vi.stubGlobal('fetch', fetcher)
  faults.catalog = true
  const user = userEvent.setup()
  try {
    renderStorefront(<App />)
    const boundary = await screen.findByRole('alert')
    expect(boundary).toHaveTextContent(
      'The product collection could not be displayed',
    )
    expect(
      screen.getByRole('heading', { name: /Find Your Everyday Ritual/ }),
    ).toBeInTheDocument()
    const header = screen.getByRole('banner')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dark mode' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    await user.click(
      screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    faults.catalog = false
    await user.click(
      within(boundary).getByRole('button', { name: 'Try Again' }),
    )
    await screen.findByRole('link', { name: 'View Velvet Body Cream' })
    expect(screen.getByRole('banner')).toBe(header)
    expect(fetcher).toHaveBeenCalledTimes(1)
  } finally {
    faults.catalog = false
    report.mockRestore()
  }
})
it('isolates page render errors and lets shared navigation leave the failed page', async () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
  faults.about = true
  const user = userEvent.setup()
  try {
    renderStorefront(<App />, { initialEntries: ['/about'] })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This page could not be displayed',
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'SHOP' }))
    await screen.findByRole('heading', { name: 'Shop ROSEVEIL', level: 1 })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  } finally {
    faults.about = false
    report.mockRestore()
  }
})
it('actually retries a rejected lazy import instead of reusing its cached rejection', async () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  const load = vi
    .fn<() => Promise<{ default: () => React.ReactNode }>>()
    .mockRejectedValueOnce(Error('Transient chunk failure'))
    .mockResolvedValueOnce({ default: () => <p>Recovered page</p> })
  const initial = lazy(load)
  const user = userEvent.setup()
  try {
    render(
      <MemoryRouter>
        <Suspense fallback={<p>Loading test page</p>}>
          <LazyPage initial={initial} load={load} />
        </Suspense>
      </MemoryRouter>,
    )
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    await screen.findByText('Recovered page')
    expect(load).toHaveBeenCalledTimes(2)
  } finally {
    report.mockRestore()
  }
})
