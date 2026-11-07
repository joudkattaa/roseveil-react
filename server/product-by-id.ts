import { products } from './catalog.ts'

export function productByIdResponse(
  request: Pick<Request, 'url' | 'method'>,
): Response {
  const headers = { 'Cache-Control': 'no-store' }
  if (request.method !== 'GET')
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { ...headers, Allow: 'GET' } },
    )
  let id: string
  try {
    id = decodeURIComponent(
      new URL(request.url).pathname.match(/^\/api\/products\/([^/]+)$/)?.[1] ??
        '',
    )
  } catch {
    return Response.json(
      { error: 'Invalid product ID' },
      { status: 400, headers },
    )
  }
  if (!/^[a-z0-9-]+$/.test(id))
    return Response.json(
      { error: 'Invalid product ID' },
      { status: 400, headers },
    )
  const product = products.find((item) => item.id === id)
  return product
    ? Response.json(product, { headers })
    : Response.json({ error: 'Product not found' }, { status: 404, headers })
}
