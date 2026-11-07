import { Link } from 'react-router'
import { useRef } from 'react'
import type { RefObject } from 'react'
import type { CatalogFilters, CatalogPhase } from '../../types/ui.types.ts'
import type {
  Category,
  Product,
} from '../../modules/products/products.types.ts'
import { findProducts } from '../../modules/products/products.logic.ts'
import CatalogControls from './CatalogControls.tsx'
import CatalogStatus from './CatalogStatus.tsx'
import ProductGrid from './ProductGrid.tsx'

interface CatalogSectionProps {
  onShopAll: () => void
  onAdd: (id: string) => void
  products: readonly Readonly<Product>[]
  phase: CatalogPhase
  catalogEmpty: boolean
  filters: CatalogFilters
  onFiltersChange: (value: CatalogFilters) => void
  onCategoryChange: (value: Category | 'All') => void
  onRetry: () => Promise<void>
  onReset: () => void
  onToggleFeatured: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}
const collections: readonly (Category | 'All')[] = [
  'All',
  'Body Care',
  'Skin Care',
  'Hair Care',
  'Gift Sets',
]

export default function CatalogSection({
  onShopAll,
  onAdd,
  products,
  phase,
  catalogEmpty,
  filters,
  onFiltersChange,
  onCategoryChange,
  onRetry,
  onReset,
  onToggleFeatured,
  headingRef,
}: CatalogSectionProps) {
  const matches =
    phase === 'ready'
      ? findProducts(
          filters.category,
          filters.query,
          filters.featured,
          filters.sort,
          products,
        )
      : []
  const filtered =
    filters.category !== 'All' ||
    Boolean(filters.query) ||
    filters.sort !== 'default'
  const retryRef = useRef<HTMLButtonElement>(null)
  async function retry() {
    await onRetry()
    if (retryRef.current) retryRef.current.focus()
    else headingRef.current?.focus({ preventScroll: true })
  }
  return (
    <section
      id="products"
      className="products container"
      aria-labelledby="products-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow" id="products-eyebrow">
            {filters.featured ? 'CURATED FAVORITES' : 'EXPLORE THE COLLECTION'}
          </p>
          <h2 id="products-title" tabIndex={-1} ref={headingRef}>
            {filters.category !== 'All'
              ? filters.category
              : filters.query
                ? 'Find Your Next Favorite'
                : 'The Roseveil Collection'}
          </h2>
        </div>
        {!filters.featured && !filtered ? (
          <button
            id="view-all"
            className="text-button"
            type="button"
            onClick={onToggleFeatured}
          >
            {!filters.featured && !filtered
              ? 'VIEW FEATURED PRODUCTS'
              : 'VIEW ALL PRODUCTS'}{' '}
            <svg className="icon" aria-hidden="true">
              <use href="#i-arrow" />
            </svg>
          </button>
        ) : (
          <Link
            id="view-all"
            className="text-button"
            to="/shop"
            onClick={onShopAll}
          >
            VIEW ALL PRODUCTS{' '}
            <svg className="icon" aria-hidden="true">
              <use href="#i-arrow" />
            </svg>
          </Link>
        )}
      </div>
      <div className="collection-toolbar">
        <nav className="collection-links" aria-label="Beauty collections">
          {collections.map((category) => (
            <button
              type="button"
              key={category}
              aria-current={
                !filters.featured && filters.category === category
                  ? 'true'
                  : undefined
              }
              onClick={() => onCategoryChange(category)}
            >
              {category === 'All' ? 'All Beauty' : category}
            </button>
          ))}
        </nav>
        <CatalogControls filters={filters} onChange={onFiltersChange} />
      </div>
      {filtered ? (
        <div id="active-filters" className="active-filters">
          <p id="filter-description">
            {[
              filters.category !== 'All' ? filters.category : '',
              filters.query ? 'Search: ' + filters.query : '',
              matches.length + ' products',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <button
            id="clear-filters"
            className="text-button"
            type="button"
            onClick={onReset}
          >
            Clear filters ×
          </button>
        </div>
      ) : null}
      <CatalogStatus
        phase={phase}
        catalogEmpty={catalogEmpty}
        resultCount={matches.length}
        category={filters.category}
        onRetry={retry}
        retryRef={retryRef}
        onReset={onReset}
      />
      <div aria-busy={phase === 'idle' || phase === 'loading'}>
        <ProductGrid products={matches} onAdd={onAdd} />
      </div>
    </section>
  )
}
