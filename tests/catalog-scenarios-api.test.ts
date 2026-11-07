// @vitest-environment node
import { createServer } from 'node:http'
import { beforeAll, afterAll, it, expect } from 'vitest'
import { productsMiddleware } from '../server/products-api.ts'
import { products } from '../server/catalog.ts'
const development = productsMiddleware(true)
const production = productsMiddleware(false)
const server = createServer((request, response) => {
  const middleware =
    request.headers['x-preview-test'] === 'yes' ? production : development
  void middleware(request, response, () => {
    response.statusCode = 404
    response.end()
  })
})
let base = ''
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw Error('Server missing')
  base = `http://127.0.0.1:${address.port}`
})
afterAll(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
)
it('serves the exact delay/3000 path after approximately three seconds', async () => {
  const start = performance.now()
  const response = await fetch(base + '/api/delay/3000')
  expect(performance.now() - start).toBeGreaterThanOrEqual(2900)
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({
    items: products,
    total: products.length,
  })
})
it('serves exact fail/500 and empty paths and rejects unsupported methods', async () => {
  expect((await fetch(base + '/api/fail/500')).status).toBe(500)
  expect(await (await fetch(base + '/api/empty')).json()).toEqual({
    items: [],
    total: 0,
  })
  for (const path of ['/api/delay/3000', '/api/fail/500', '/api/empty']) {
    const response = await fetch(base + path, { method: 'POST' })
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
    expect(
      (await fetch(base + path, { headers: { 'x-preview-test': 'yes' } }))
        .status,
    ).toBe(404)
  }
})
