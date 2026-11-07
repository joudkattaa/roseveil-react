import { renderHook, waitFor, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'
import StorefrontProvider from '../src/features/storefront/StorefrontProvider.tsx'
import { useStorefront } from '../src/features/storefront/useStorefront.ts'
import { renderStorefront } from './renderStorefront.tsx'
import { products } from '../server/catalog.ts'

function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

it('deduplicates loads, cancels silently, retries immediately and ignores a late transport', async () => {
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'body-cream', quantity: 2 }],
      promoCode: 'GLOW20',
    }),
  )
  const old = deferred<Response>()
  const fetcher = vi
    .fn((_input: RequestInfo | URL, _options?: RequestInit) => old.promise)
    .mockResolvedValueOnce(Response.json({ items: products }))
    .mockImplementationOnce(() => old.promise)
    .mockResolvedValueOnce(Response.json({ items: products }))
  const store = createStorefrontAdapter({ fetcher })
  await store.actions.loadCatalog()
  const errors: unknown[] = []
  const stop = store.subscribe(() => {
    if (store.getSnapshot().error) errors.push(store.getSnapshot().error)
  })
  const pending = store.actions.loadCatalog()
  expect(store.actions.loadCatalog()).toBe(pending)
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  const signal = fetcher.mock.calls[1]?.[1]?.signal
  if (!signal) throw new Error('Missing catalog signal')
  store.cancelCatalog()
  expect(signal.aborted).toBe(true)
  expect(store.getSnapshot()).toMatchObject({ phase: 'idle', error: null })
  expect(store.actions.addProduct('serum')).toBe(false)
  await store.actions.loadCatalog()
  expect(store.getSnapshot().phase).toBe('ready')
  old.resolve(
    Response.json({ items: products.filter((p) => p.id !== 'body-cream') }),
  )
  await new Promise((done) => setTimeout(done, 0))
  expect(store.getSnapshot().catalog).toHaveLength(30)
  expect(store.getSnapshot().cart).toEqual([{ id: 'body-cream', quantity: 2 }])
  expect(store.getSnapshot().promoCode).toBe('GLOW20')
  expect(errors).toEqual([])
  stop()
})

it('cancels while a response body is pending without publishing a late catalog', async () => {
  const stream = new TransformStream<Uint8Array, Uint8Array>()
  const writer = stream.writable.getWriter()
  const fetcher = vi.fn(
    async (_input: RequestInfo | URL, _options?: RequestInit) =>
      new Response(stream.readable),
  )
  const store = createStorefrontAdapter({ fetcher })
  const pending = store.actions.loadCatalog()
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
  store.cancelCatalog()
  await pending
  await writer.write(
    new TextEncoder().encode(JSON.stringify({ items: products })),
  )
  await writer.close()
  await new Promise((done) => setTimeout(done, 0))
  expect(store.getSnapshot()).toMatchObject({
    phase: 'idle',
    error: null,
    catalog: [],
  })
})

it('defers owner release so StrictMode reacquisition preserves a pending request', async () => {
  vi.useFakeTimers()
  try {
    const old = deferred<Response>()
    const fetcher = vi.fn(
      (_input: RequestInfo | URL, _options?: RequestInit) => old.promise,
    )
    const store = createStorefrontAdapter({ fetcher })
    const release = store.retainCatalog()
    const pending = store.actions.loadCatalog()
    await Promise.resolve()
    await Promise.resolve()
    const signal = fetcher.mock.calls[0]?.[1]?.signal
    if (!signal) throw new Error('Missing catalog signal')
    release()
    release()
    const releaseAgain = store.retainCatalog()
    vi.runOnlyPendingTimers()
    expect(signal.aborted).toBe(false)
    expect(store.actions.loadCatalog()).toBe(pending)
    releaseAgain()
    vi.runOnlyPendingTimers()
    expect(signal.aborted).toBe(true)
    await pending
    expect(store.getSnapshot()).toMatchObject({ phase: 'idle', error: null })
  } finally {
    vi.useRealTimers()
  }
})

interface ProbeProps {
  id: string
}
function Probe({ id }: ProbeProps) {
  const { snapshot } = useStorefront()
  return <output aria-label={id}>{snapshot.phase}</output>
}

it('does not cancel a shared request when one consumer unmounts', async () => {
  const delayed = deferred<Response>()
  const fetcher = vi.fn(
    (_input: RequestInfo | URL, _options?: RequestInit) => delayed.promise,
  )
  vi.stubGlobal('fetch', fetcher)
  const view = renderStorefront(
    <>
      <Probe key="header" id="header" />
      <Probe key="page" id="page" />
    </>,
  )
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
  view.rerender(<Probe key="header" id="header" />)
  await new Promise((done) => setTimeout(done, 10))
  expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(false)
  delayed.resolve(Response.json({ items: products }))
  await waitFor(() =>
    expect(screen.getByLabelText('header')).toHaveTextContent('ready'),
  )
  expect(fetcher).toHaveBeenCalledTimes(1)
})

it('cleans a real provider unmount, survives rapid remount, and makes one request per committed provider', async () => {
  const delayed = deferred<Response>()
  const fetcher = vi
    .fn((_input: RequestInfo | URL, _options?: RequestInit) => delayed.promise)
    .mockImplementationOnce(() => delayed.promise)
    .mockResolvedValueOnce(Response.json({ items: products }))
  vi.stubGlobal('fetch', fetcher)
  const options = { wrapper: StorefrontProvider, reactStrictMode: true }
  const first = renderHook(() => useStorefront(), options)
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
  const signal = fetcher.mock.calls[0]?.[1]?.signal
  if (!signal) throw new Error('Missing catalog signal')
  expect(signal.aborted).toBe(false)
  first.unmount()
  const second = renderHook(() => useStorefront(), options)
  await waitFor(() =>
    expect(second.result.current.snapshot.phase).toBe('ready'),
  )
  await waitFor(() => expect(signal.aborted).toBe(true))
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(second.result.current.snapshot.error).toBeNull()
})
