import { useEffect, useRef, useState } from 'react'
import type { CatalogFilters } from '../../types/ui.types.ts'
import {
  isCategory,
  isSortOrder,
  productCategories,
} from '../../modules/products/products.logic.ts'
import SearchField from './SearchField.tsx'

interface CatalogControlsProps {
  filters: CatalogFilters
  onChange: (filters: CatalogFilters) => void
}

const tools = [
  { id: 'search', label: 'Search products', icon: 'search' },
  { id: 'category', label: 'All categories', icon: 'filter' },
  { id: 'sort', label: 'Sort products by price', icon: 'sort' },
]

export default function CatalogControls({
  filters,
  onChange,
}: CatalogControlsProps) {
  const [open, setOpen] = useState<string | null>(null)
  const root = useRef<HTMLFormElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) return
    // Scoped DOM access is for native control focus only; React owns rendering.
    root.current
      ?.querySelector<HTMLElement>('details[open] input, details[open] select')
      ?.focus()
    function outside(event: PointerEvent) {
      if (
        !(event.target instanceof Node) ||
        root.current?.contains(event.target)
      )
        return
      const restore = root.current?.contains(document.activeElement)
      setOpen(null)
      if (restore) trigger.current?.focus()
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  return (
    <form
      ref={root}
      id="catalog-controls"
      className="catalog-tools"
      role="search"
      aria-label="Filter the collection"
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(null)
          trigger.current?.focus()
        }
      }}
    >
      {tools.map((tool) => (
        <details
          key={tool.id}
          className={`catalog-tool${tool.id === 'search' ? ' catalog-search-tool' : ''}`}
          open={open === tool.id}
        >
          <summary
            aria-label={tool.label}
            title={tool.label}
            onClick={(event) => {
              event.preventDefault()
              trigger.current = event.currentTarget
              setOpen((current) => (current === tool.id ? null : tool.id))
            }}
          >
            <svg className="icon" aria-hidden="true">
              <use href={`#i-${tool.icon}`} />
            </svg>
          </summary>
          <div
            className={`catalog-popup${tool.id === 'search' ? ' catalog-search-popup' : ''}`}
          >
            {tool.id === 'search' ? (
              <SearchField
                id="catalog-search"
                label="Search products"
                placeholder="Find your next little luxury"
                value={filters.query}
                onChange={(query) =>
                  onChange({ ...filters, query, featured: false })
                }
              />
            ) : tool.id === 'category' ? (
              <>
                <label htmlFor="category-select">All Categories</label>
                <select
                  id="category-select"
                  name="category"
                  value={filters.category}
                  aria-controls="product-grid"
                  onChange={(event) => {
                    const category = event.target.value
                    if (isCategory(category))
                      onChange({ ...filters, category, featured: false })
                  }}
                >
                  <option value="All">All Categories</option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="price-sort">Sort by</label>
                <select
                  id="price-sort"
                  name="sort"
                  value={filters.sort}
                  aria-controls="product-grid"
                  onChange={(event) => {
                    const sort = event.target.value
                    if (isSortOrder(sort))
                      onChange({ ...filters, sort, featured: false })
                  }}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </>
            )}
          </div>
        </details>
      ))}
    </form>
  )
}
