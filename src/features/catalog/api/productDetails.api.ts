import { ApiError, fetchJson } from '../../../shared/api/client.ts'
import { abortableFetch } from '../../../shared/api/abortableFetch.ts'
import type { Product } from '../../../modules/products/products.types.ts'
import { isProduct, isProductId } from './product.validation.ts'

interface ProductRequestOptions {
  signal?: AbortSignal
  fetcher?: typeof fetch
}

export async function getProductById(
  id: unknown,
  options: ProductRequestOptions = {},
): Promise<Product> {
  if (!isProductId(id)) throw new ApiError('Invalid product ID.', 400)
  const signal = options.signal ?? new AbortController().signal
  signal.throwIfAborted()
  try {
    const product = await fetchJson(
      '/products/' + encodeURIComponent(id),
      isProduct,
      { signal },
      abortableFetch(options.fetcher ?? globalThis.fetch, signal),
    )
    signal.throwIfAborted()
    if (product.id !== id)
      throw new ApiError('The API returned a different product.', 200)
    return { ...product }
  } catch (error) {
    // The protected client wraps aborts; restore a distinguishable cancellation.
    if (signal.aborted)
      throw (
        signal.reason ?? new DOMException('Request cancelled.', 'AbortError')
      )
    throw error
  }
}
