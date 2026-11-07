import { getProductById } from '../src/features/catalog/api/productDetails.api.ts'
import productEndpoint from '../api/products/[id].ts'
// @vitest-environment node
import { createServer } from 'node:http'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { productsMiddleware } from '../server/products-api.ts'
import { getProducts } from '../src/modules/products/products.api.ts'
import { products } from '../server/catalog.ts'
import endpoint from '../api/products.ts'

const middleware = productsMiddleware(true)
const server = createServer((request, response) => {
  void middleware(request, response, () => {
    response.statusCode = 404
    response.end()
  })
})
let base = ''
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw Error('Server unavailable')
  base = `http://127.0.0.1:${address.port}`
})
afterAll(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
)
it('serves original data, validates client responses, and rejects unsupported methods', async () => {
  const response = await fetch(base + '/api/products')
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({ items: products, total: 30 })
  expect(
    await getProducts((url, options) => fetch(base + url, options)),
  ).toHaveLength(30)
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
    const failed = await fetch(base + '/api/products', { method })
    expect(failed.status).toBe(405)
    expect(failed.headers.get('allow')).toBe('GET')
  }
})
it('keeps test simulations development-only', async () => {
  expect((await fetch(base + '/api/products?error=500')).status).toBe(500)
  expect(await (await fetch(base + '/api/products?empty=1')).json()).toEqual({
    items: [],
    total: 0,
  })
  const begin = Date.now()
  await fetch(base + '/api/products?delay=50')
  expect(Date.now() - begin).toBeGreaterThanOrEqual(40)
  expect(
    await endpoint
      .fetch(new Request('http://local/api/products?empty=1&error=500'))
      .json(),
  ).toEqual({ items: products, total: 30 })
  expect(
    endpoint.fetch(new Request('http://local/api/products', { method: 'POST' }))
      .status,
  ).toBe(405)
})
it('rejects invalid JSON, duplicate IDs, invalid prices and network failure', async () => {
  const product = products[0]
  if (!product) throw Error('Fixture missing')
  for (const body of [
    { items: [product, product] },
    { items: [{ ...product, price: -1 }] },
  ])
    await expect(getProducts(async () => Response.json(body))).rejects.toThrow(
      'invalid format',
    )
  await expect(
    getProducts(async () => new Response('not json')),
  ).rejects.toThrow('JSON')
  await expect(
    getProducts(async () => {
      throw Error('offline')
    }),
  ).rejects.toThrow('reach the server')
})

it('serves single products by ID in development and the serverless handler', async () => {
  const response = await fetch(base + '/api/products/serum')
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  const item = products.find((p) => p.id === 'serum')
  expect(await response.json()).toEqual(item)
  expect(
    await getProductById('serum', {
      fetcher: (url, options) => fetch(base + url, options),
    }),
  ).toEqual(item)
  expect((await fetch(base + '/api/products/missing-product')).status).toBe(404)
  expect((await fetch(base + '/api/products/%25bad')).status).toBe(400)
  expect(
    (await fetch(base + '/api/products/serum', { method: 'POST' })).status,
  ).toBe(405)
  expect(
    await productEndpoint
      .fetch(new Request('http://local/api/products/serum'))
      .json(),
  ).toEqual(item)
  expect(
    productEndpoint.fetch(
      new Request('http://local/api/products/missing-product'),
    ).status,
  ).toBe(404)
  expect(
    productEndpoint.fetch(
      new Request('http://local/api/products/serum', { method: 'DELETE' }),
    ).status,
  ).toBe(405)
})
