import { useEffect, useState } from 'react'
import type { Product } from '../../modules/products/products.types.ts'
import { ApiError } from '../../shared/api/client.ts'
import { getProductById } from './api/productDetails.api.ts'
import { isProductId } from './api/product.validation.ts'

type ProductResult = { id: string; attempt: number } & (
  | { phase: 'ready'; product: Readonly<Product> }
  | { phase: 'not-found' | 'error' }
)
export function useProductDetails(id: string | undefined) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ProductResult | null>(null)
  useEffect(() => {
    if (!isProductId(id)) return
    const controller = new AbortController()
    void getProductById(id, { signal: controller.signal }).then(
      (product) => {
        if (!controller.signal.aborted)
          setResult({ id, attempt, phase: 'ready', product })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          id,
          attempt,
          phase:
            error instanceof ApiError && error.status === 404
              ? 'not-found'
              : 'error',
        })
      },
    )
    return () => controller.abort()
  }, [id, attempt])
  const state = !isProductId(id)
    ? { phase: 'invalid' }
    : result?.id === id && result.attempt === attempt
      ? result
      : { phase: 'loading' }
  return { state, retry: () => setAttempt((current) => current + 1) }
}
