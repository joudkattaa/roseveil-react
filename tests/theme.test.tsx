import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { products } from '../server/catalog.ts'

function systemPreference(dark: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)' && dark,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => true,
  }))
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
}

it.each([
  { saved: null, systemDark: true, expected: 'dark' },
  { saved: null, systemDark: false, expected: 'light' },
  { saved: 'light', systemDark: true, expected: 'light' },
  { saved: 'dark', systemDark: false, expected: 'dark' },
  { saved: 'invalid', systemDark: true, expected: 'dark' },
])(
  'uses saved $saved with system dark=$systemDark as $expected',
  async ({ saved, systemDark, expected }) => {
    systemPreference(systemDark)
    if (saved !== null) localStorage.setItem('roseveil-theme', saved)
    const view = render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(document.documentElement).toHaveAttribute('data-theme', expected)
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      String(expected === 'dark'),
    )
    await screen.findByRole('button', { name: 'View Velvet Body Cream' })
    // Reading the system default never creates a saved user choice.
    expect(localStorage.getItem('roseveil-theme')).toBe(saved)
    systemPreference(!systemDark)
    view.rerender(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(document.documentElement).toHaveAttribute('data-theme', expected)
  },
)

it('switches with Enter and Space, saves the choice and restores it on remount', async () => {
  systemPreference(false)
  const user = userEvent.setup()
  const view = render(<App />)
  const toggle = screen.getByRole('button', { name: 'Dark mode' })
  toggle.focus()
  await user.keyboard('{Enter}')
  expect(toggle).toHaveFocus()
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  expect(localStorage.getItem('roseveil-theme')).toBe('dark')
  await user.keyboard(' ')
  expect(localStorage.getItem('roseveil-theme')).toBe('light')
  await user.click(toggle)
  view.unmount()
  render(<App />)
  expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await screen.findByRole('button', { name: 'View Velvet Body Cream' })
})

it('still switches in memory when localStorage is blocked', async () => {
  systemPreference(true)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Blocked')
  })
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
  await waitFor(() =>
    expect(document.documentElement).toHaveAttribute('data-theme', 'light'),
  )
  await screen.findByRole('button', { name: 'View Velvet Body Cream' })
})
