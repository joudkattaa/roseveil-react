import { renderHook, act, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import StorefrontProvider from '../src/features/storefront/StorefrontProvider.tsx'
import { useStorefront } from '../src/features/storefront/useStorefront.ts'
import { renderStorefront } from './renderStorefront.tsx'
import { cartTotals } from '../src/logic.ts'
import { products } from '../server/catalog.ts'

function catalog() {
  const fetcher = vi.fn(async () => Response.json({ items: products }))
  vi.stubGlobal('fetch', fetcher)
  return fetcher
}
const options = { wrapper: StorefrontProvider, reactStrictMode: true }

it('requires the shared provider instead of silently creating a private store', () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    expect(() => renderHook(() => useStorefront())).toThrow(
      'useStorefront must be used inside StorefrontProvider.',
    )
  } finally {
    report.mockRestore()
  }
})

it('shares actions, immutable snapshots and calculated totals across consumers', async () => {
  const fetcher = catalog()
  const { result } = renderHook(
    () => ({ first: useStorefront(), second: useStorefront() }),
    options,
  )
  await waitFor(() => expect(result.current.first.snapshot.phase).toBe('ready'))
  expect(result.current.first.actions).toBe(result.current.second.actions)
  expect(result.current.first.snapshot).toBe(result.current.second.snapshot)
  const before = result.current.first.snapshot
  act(() => {
    result.current.first.actions.addProduct('body-cream')
  })
  act(() => {
    result.current.second.actions.changeQuantity('body-cream', 1)
  })
  act(() => {
    result.current.first.actions.setPromoCode('GLOW20')
  })
  const { first, second } = result.current
  expect(first.snapshot).toBe(second.snapshot)
  expect(before.cart).toEqual([])
  expect(Object.isFrozen(first.snapshot)).toBe(true)
  expect(Object.isFrozen(first.snapshot.cart)).toBe(true)
  expect(Object.isFrozen(first.snapshot.cart[0])).toBe(true)
  expect(first.snapshot.cart).toEqual([{ id: 'body-cream', quantity: 2 }])
  expect(
    cartTotals(
      second.snapshot.cart,
      second.snapshot.promoCode,
      second.snapshot.catalog,
    ),
  ).toMatchObject({ count: 2, subtotal: 5598, discount: 1120, total: 5073 })
  expect(fetcher).toHaveBeenCalledTimes(1)
})

interface CartConsumerProps {
  id: string
}
function CartConsumer({ id }: CartConsumerProps) {
  const { snapshot, actions } = useStorefront()
  const count = snapshot.cart.reduce((sum, item) => sum + item.quantity, 0)
  return (
    <div>
      <output aria-label={'Cart ' + id}>{count}</output>
      <button
        type="button"
        disabled={snapshot.phase !== 'ready'}
        onClick={() => actions.addProduct('body-cream')}
      >
        {'Add from ' + id}
      </button>
    </div>
  )
}

it('keeps one cart when a page consumer remounts beneath the same provider', async () => {
  const fetcher = catalog()
  const user = userEvent.setup()
  const view = renderStorefront(
    <>
      <CartConsumer id="header" />
      <CartConsumer key="first-page" id="page" />
    </>,
  )
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Add from page' })).toBeEnabled(),
  )
  await user.click(screen.getByRole('button', { name: 'Add from page' }))
  expect(screen.getByLabelText('Cart header')).toHaveTextContent('1')
  view.rerender(
    <>
      <CartConsumer id="header" />
      <CartConsumer key="second-page" id="page" />
    </>,
  )
  expect(screen.getByLabelText('Cart page')).toHaveTextContent('1')
  await user.click(screen.getByRole('button', { name: 'Add from header' }))
  expect(screen.getByLabelText('Cart page')).toHaveTextContent('2')
  expect(fetcher).toHaveBeenCalledTimes(1)
})

it('restores cart, promo and theme after the provider is fully unmounted and recreated', async () => {
  const fetcher = catalog()
  const first = renderHook(() => useStorefront(), options)
  await waitFor(() => expect(first.result.current.snapshot.phase).toBe('ready'))
  act(() => {
    first.result.current.actions.addProduct('body-cream')
    first.result.current.actions.changeQuantity('body-cream', 1)
    first.result.current.actions.setPromoCode('GLOW20')
    first.result.current.actions.setTheme('dark')
  })
  first.unmount()
  const second = renderHook(() => useStorefront(), options)
  await waitFor(() =>
    expect(second.result.current.snapshot.phase).toBe('ready'),
  )
  expect(second.result.current.snapshot.cart).toEqual([
    { id: 'body-cream', quantity: 2 },
  ])
  expect(second.result.current.snapshot.promoCode).toBe('GLOW20')
  expect(second.result.current.snapshot.theme).toBe('dark')
  expect(fetcher).toHaveBeenCalledTimes(2)
})

it('keeps the committed store stable through StrictMode rerenders and cleans subscriptions', async () => {
  const fetcher = catalog()
  const rendered = vi.fn()
  const view = renderHook(() => {
    rendered()
    return useStorefront()
  }, options)
  await waitFor(() => expect(view.result.current.snapshot.phase).toBe('ready'))
  const actions = view.result.current.actions
  const snapshot = view.result.current.snapshot
  view.rerender()
  expect(view.result.current.actions).toBe(actions)
  expect(view.result.current.snapshot).toBe(snapshot)
  expect(fetcher).toHaveBeenCalledTimes(1)
  view.unmount()
  const renderCount = rendered.mock.calls.length
  act(() => {
    actions.addProduct('body-cream')
  })
  expect(rendered).toHaveBeenCalledTimes(renderCount)
})
