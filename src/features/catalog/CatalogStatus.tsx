import type { Ref } from 'react'
import type { Category } from '../../modules/products/products.types.ts'
import type { CatalogPhase } from '../../types/ui.types.ts'

interface CatalogStatusProps {
  resultCount: number
  category: Category | 'All'
  onReset: () => void
  retryRef: Ref<HTMLButtonElement>
  phase: CatalogPhase
  catalogEmpty: boolean
  onRetry: () => Promise<void>
}

export default function CatalogStatus({
  resultCount,
  category,
  onReset,
  retryRef,
  phase,
  catalogEmpty,
  onRetry,
}: CatalogStatusProps) {
  const pending = phase === 'idle' || phase === 'loading'
  const message = pending
    ? 'Loading ROSEVEIL products…'
    : phase === 'error'
      ? 'Unable to load products. Please try again.'
      : catalogEmpty
        ? 'No products are available right now.'
        : ''
  return (
    <>
      <p
        id="filter-status"
        className="product-results"
        role="status"
        aria-atomic="true"
      >
        {phase === 'ready' && !catalogEmpty
          ? resultCount +
            ' ' +
            (resultCount === 1 ? 'product' : 'products') +
            ' shown' +
            (category !== 'All' ? ' in ' + category : '') +
            '.'
          : ''}
      </p>
      <p id="catalog-status" role="status" aria-atomic="true">
        {message}
      </p>
      {phase === 'ready' && !catalogEmpty && resultCount === 0 ? (
        <div id="empty-state" className="empty-state">
          <h3>A little change of search?</h3>
          <p>
            We couldn’t find a match. Try “serum”, “rose”, or explore the full
            collection.
          </p>
          <button
            className="button"
            id="empty-reset"
            type="button"
            onClick={onReset}
          >
            EXPLORE ALL PRODUCTS
          </button>
        </div>
      ) : null}
      {phase === 'error' ? (
        <button
          ref={retryRef}
          className="button"
          type="button"
          onClick={() => {
            void onRetry()
          }}
        >
          Try Again
        </button>
      ) : null}
    </>
  )
}
