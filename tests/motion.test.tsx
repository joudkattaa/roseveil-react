import { MemoryRouter } from 'react-router'
import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import ProductImage from '../src/features/catalog/ProductImage.tsx'
import ProductGrid from '../src/features/catalog/ProductGrid.tsx'
import { secondaryImages } from '../src/features/catalog/secondaryImages.ts'
import Dialog from '../src/shared/ui/Dialog.tsx'
import { useScrollReveal } from '../src/shared/motion/useScrollReveal.ts'
import { products } from '../server/catalog.ts'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'
import { useShoppingBag } from '../src/features/cart/useShoppingBag.ts'
import { renderHook } from '@testing-library/react'

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
})
function preferenceValue(matches: boolean) {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => true,
  }
}

const product = products[0]
if (!product) throw new Error('Product fixture missing')

it('keeps one primary photo when no verified second view exists', () => {
  render(<ProductImage product={product} />)
  expect(screen.getAllByRole('img')).toHaveLength(1)
  expect(document.querySelector('.product-secondary')).toBeNull()
  expect(Object.keys(secondaryImages)).toHaveLength(0)
})

it('prepares a secondary crossfade only after load and falls back after failure', () => {
  // Test-only URL simulates a future verified second photo; it is not shipped as an asset.
  const secondary = '/test-only/second-view.webp'
  const view = render(
    <ProductImage product={product} secondaryImage={secondary} />,
  )
  const image = document.querySelector('.product-secondary')
  if (!image) throw new Error('Secondary fixture missing')
  expect(image).toHaveAttribute('loading', 'lazy')
  expect(image).toHaveAttribute('alt', '')
  expect(document.querySelector('.product-image-stack')).toHaveAttribute(
    'data-secondary-ready',
    'false',
  )
  fireEvent.load(image)
  expect(document.querySelector('.product-image-stack')).toHaveAttribute(
    'data-secondary-ready',
    'true',
  )
  fireEvent.error(image)
  expect(document.querySelector('.product-image-stack')).toHaveAttribute(
    'data-secondary-ready',
    'false',
  )
  expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument()
  view.rerender(
    <ProductImage
      product={product}
      secondaryImage={secondary}
      variant="cart"
    />,
  )
  expect(document.querySelector('.product-secondary')).toBeNull()
})

it('keeps product links and add actions without floating metadata', () => {
  const onAdd = vi.fn()
  render(
    <MemoryRouter>
      <ProductGrid products={[product]} onAdd={onAdd} />
    </MemoryRouter>,
  )
  expect(document.getElementById('product-grid')).not.toHaveAttribute(
    'data-featured',
  )
  expect(
    screen.getByRole('link', { name: 'View ' + product.name }),
  ).toHaveAttribute('href', '/products/' + product.id)
  fireEvent.click(
    screen.getByRole('button', { name: 'Add ' + product.name + ' to bag' }),
  )
  expect(onAdd).toHaveBeenCalledWith(product.id)
})

interface MotionHarnessProps {
  extra?: boolean
}
function MotionHarness({ extra = false }: MotionHarnessProps) {
  const root = useScrollReveal()
  return (
    <main ref={root}>
      <section aria-label="Story">Always visible</section>
      {extra ? (
        <section aria-label="Lazy section">New page content</section>
      ) : null}
    </main>
  )
}

it('leaves scroll content visible when observation is unavailable', () => {
  vi.stubGlobal('IntersectionObserver', undefined)
  render(<MotionHarness />)
  expect(screen.getByText('Always visible')).toBeVisible()
  expect(screen.getByRole('region', { name: 'Story' })).not.toHaveAttribute(
    'style',
  )
})

it('reveals once, skips motion for reduced preference and cleans observers and animations', async () => {
  let notify: IntersectionObserverCallback | undefined
  const instances: IntersectionObserver[] = []
  let preferenceChange: (() => void) | undefined
  const preference = {
    ...preferenceValue(false),
    addEventListener: vi.fn((_event: string, listener: () => void) => {
      preferenceChange = listener
    }),
    removeEventListener: vi.fn(),
  }
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference)
  const cancel = vi.fn()
  const animate = vi.fn(() => ({
    finished: new Promise<void>(() => {}),
    cancel,
  }))
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animate,
  })
  const disconnect = vi.fn()
  const unobserve = vi.fn()
  const observe = vi.fn()
  class Observer implements IntersectionObserver {
    root = null
    rootMargin = '0px'
    scrollMargin = '0px'
    thresholds = [0.08]
    constructor(callback: IntersectionObserverCallback) {
      notify = callback
      instances.push(this)
    }
    observe = observe
    unobserve = unobserve
    disconnect = disconnect
    takeRecords() {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', Observer)
  const view = render(<MotionHarness />)
  const target = screen.getByRole('region', { name: 'Story' })
  const entry = {
    target,
    isIntersecting: true,
    intersectionRatio: 1,
    time: 0,
    rootBounds: null,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRect: target.getBoundingClientRect(),
  }
  const instance = instances[0]
  if (!notify || !instance) throw new Error('Observer was not initialized')
  const entries = [entry]
  notify(entries, instance)
  notify(entries, instance)
  expect(animate).toHaveBeenCalledTimes(1)
  view.rerender(<MotionHarness extra />)
  const added = screen.getByRole('region', { name: 'Lazy section' })
  await waitFor(() => expect(observe).toHaveBeenCalledWith(added))
  view.rerender(<MotionHarness />)
  await waitFor(() => expect(unobserve).toHaveBeenCalledWith(added))
  preference.matches = true
  preferenceChange?.()
  expect(cancel).toHaveBeenCalledTimes(1)
  notify?.(entries, instance)
  expect(animate).toHaveBeenCalledTimes(1)
  expect(target).toBeVisible()
  view.unmount()
  expect(disconnect).toHaveBeenCalled()
  expect(preference.removeEventListener).toHaveBeenCalled()
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
})

it('keeps the native modal open until its close animation finishes and restores focus', async () => {
  let finish = () => {}
  const finished = new Promise<void>((resolve) => {
    finish = resolve
  })
  const cancel = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: vi.fn(() => ({ finished, cancel })),
  })
  const opener = document.createElement('button')
  document.body.append(opener)
  opener.focus()
  vi.spyOn(window, 'matchMedia').mockReturnValue(preferenceValue(false))
  const onClose = vi.fn()
  const view = render(
    <StrictMode>
      <Dialog title="Bag" onClose={onClose}>
        <p>Bag contents</p>
      </Dialog>
    </StrictMode>,
  )
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Close dialog',
    }),
  )
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toHaveAttribute('open')
  await act(async () => {
    finish()
    await finished
  })
  expect(onClose).toHaveBeenCalledTimes(1)
  view.unmount()
  expect(opener).toHaveFocus()
  opener.remove()
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
})

it('closes without waiting when reduced motion is requested', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preferenceValue(true))
  const animate = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animate,
  })
  const onClose = vi.fn()
  render(
    <Dialog title="Bag" onClose={onClose}>
      Content
    </Dialog>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(animate).not.toHaveBeenCalled()
  Reflect.deleteProperty(HTMLElement.prototype, 'animate')
})

it('triggers bag feedback only for successful adds, not quantity edits or rejected adds', async () => {
  const store = createStorefrontAdapter({
    fetcher: async () => Response.json({ items: products }),
  })
  await store.actions.loadCatalog()
  const { result, rerender } = renderHook(
    ({ snapshot }) =>
      useShoppingBag(snapshot, store.actions, vi.fn(), { current: null }),
    { initialProps: { snapshot: store.getSnapshot() } },
  )
  act(() => result.current.addProduct(product.id))
  expect(result.current.bagFeedback).toBe(1)
  rerender({ snapshot: store.getSnapshot() })
  act(() => result.current.changeQuantity(product.id, 1))
  expect(result.current.bagFeedback).toBe(1)
  act(() => result.current.addProduct('not-a-product'))
  expect(result.current.bagFeedback).toBe(1)
})
