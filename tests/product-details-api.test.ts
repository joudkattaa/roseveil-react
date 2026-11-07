import { expect, it, vi } from 'vitest'
import { getProductById } from '../src/features/catalog/api/productDetails.api.ts'
import { products } from '../server/catalog.ts'

const product = products[0]
if (!product) throw new Error('Missing product fixture')

it.each([
  undefined,
  null,
  '',
  '../serum',
  'serum/cream',
  '%2F',
  'UPPER',
  'serum?x=1',
])('rejects invalid ID %s before fetching', async (id) => {
  const fetcher = vi.fn()
  await expect(getProductById(id, { fetcher })).rejects.toMatchObject({
    status: 400,
  })
  expect(fetcher).not.toHaveBeenCalled()
})

it('uses the central API path and validates the response identity and fields', async () => {
  const fetcher = vi.fn(async () => Response.json(product))
  const controller = new AbortController()
  await expect(
    getProductById(product.id, { fetcher, signal: controller.signal }),
  ).resolves.toEqual(product)
  expect(fetcher).toHaveBeenCalledWith(
    '/api/products/' + product.id,
    expect.objectContaining({ signal: controller.signal }),
  )
  for (const body of [
    null,
    { ...product, price: -1 },
    { ...product, category: 'Unknown' },
    { ...product, name: '' },
    { ...product, id: 'different-id' },
  ]) {
    await expect(
      getProductById(product.id, { fetcher: async () => Response.json(body) }),
    ).rejects.toThrow()
  }
  await expect(
    getProductById('missing-product', {
      fetcher: async () => new Response('{}', { status: 404 }),
    }),
  ).rejects.toMatchObject({ status: 404 })
})

it('returns a recognizable abort for an already-cancelled single-product request', async () => {
  const controller = new AbortController()
  controller.abort()
  const fetcher = vi.fn()
  await expect(
    getProductById(product.id, { signal: controller.signal, fetcher }),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(fetcher).not.toHaveBeenCalled()
})

it('cancels a single-product request even if the transport ignores its signal', async () => {
  const controller = new AbortController()
  const fetcher = vi.fn(() => new Promise<Response>(() => {}))
  const pending = getProductById(product.id, {
    signal: controller.signal,
    fetcher,
  })
  const expected = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  await Promise.resolve()
  controller.abort()
  await expected
})
