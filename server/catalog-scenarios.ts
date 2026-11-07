import { products } from './catalog.ts'

// Assignment scenarios are literal local API paths and development-only.
export async function catalogScenarioResponse(
  request: Pick<Request, 'url' | 'method'>,
): Promise<Response | null> {
  const path = new URL(request.url).pathname
  if (!['/api/delay/3000', '/api/fail/500', '/api/empty'].includes(path))
    return null
  const headers = { 'Cache-Control': 'no-store' }
  if (request.method !== 'GET')
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { ...headers, Allow: 'GET' } },
    )
  if (path === '/api/fail/500')
    return Response.json(
      { error: 'Assignment test failure' },
      { status: 500, headers },
    )
  if (path === '/api/delay/3000')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  const items = path === '/api/empty' ? [] : products
  return Response.json({ items, total: items.length }, { headers })
}
