import type { Category, SortOrder } from '../modules/products/products.types.ts'

export type CatalogPhase = 'idle' | 'loading' | 'ready' | 'error'

export interface CatalogFailure {
  readonly message: string
  readonly status: number
}

export interface CatalogFilters {
  readonly category: Category | 'All'
  readonly query: string
  readonly sort: SortOrder
  readonly featured: boolean
}
