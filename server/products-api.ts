import type { Connect } from 'vite'
import { catalogScenarioResponse } from './catalog-scenarios.ts'
import { products } from './catalog.ts'
import { productByIdResponse } from './product-by-id.ts'

// Both Vite servers use the same source catalog; no generated catalog is maintained.
export function productsMiddleware(
  development = false,
): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (development) {
      const scenario = await catalogScenarioResponse({
        url: url.href,
        method: request.method ?? 'GET',
      })
      if (scenario) {
        response.statusCode = scenario.status
        scenario.headers.forEach((value, name) =>
          response.setHeader(name, value),
        )
        response.end(await scenario.text())
        return
      }
    }
    if (url.pathname.startsWith('/api/products/')) {
      const result = productByIdResponse({
        url: url.href,
        method: request.method ?? 'GET',
      })
      response.statusCode = result.status
      result.headers.forEach((value, name) => response.setHeader(name, value))
      response.end(await result.text())
      return
    }
    if (url.pathname !== '/api/products') return next()
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    if (request.method !== 'GET') {
      response.statusCode = 405
      response.setHeader('Allow', 'GET')
      response.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }
    if (development) {
      const delay = Number(url.searchParams.get('delay'))
      if (Number.isFinite(delay) && delay > 0)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(delay, 3000)),
        )
      if (url.searchParams.get('error') === '500') {
        response.statusCode = 500
        response.end(JSON.stringify({ error: 'Development test error' }))
        return
      }
    }
    const items =
      development && url.searchParams.get('empty') === '1' ? [] : products
    response.end(JSON.stringify({ items, total: items.length }))
  }
}
