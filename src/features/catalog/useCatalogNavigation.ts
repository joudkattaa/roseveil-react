import { useRef, useState } from 'react'
import type { Category } from '../../modules/products/products.types.ts'
import type { CatalogFilters } from '../../types/ui.types.ts'
import { navigationItems } from '../navigation/navigation.ts'

export function useCatalogNavigation(featured = true) {
  const [filters, setFilters] = useState<CatalogFilters>({
    category: 'All',
    query: '',
    sort: 'default',
    featured,
  })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const filtered =
    filters.category !== 'All' ||
    Boolean(filters.query) ||
    filters.sort !== 'default'
  const activeId =
    filters.featured && !filtered
      ? 'home'
      : !filters.featured
        ? navigationItems.find(
            (item) => item.available && item.category === filters.category,
          )?.id
        : undefined
  function selectCategory(category: Category | 'All') {
    setFilters((current) => ({ ...current, category, featured: false }))
  }
  function changeQuery(query: string) {
    setFilters((current) => ({ ...current, query, featured: false }))
  }
  function home() {
    setFilters({ category: 'All', query: '', sort: 'default', featured: true })
  }
  function reset() {
    setFilters({ category: 'All', query: '', sort: 'default', featured: false })
    headingRef.current?.focus({ preventScroll: true })
  }
  function toggleFeatured() {
    setFilters({
      category: 'All',
      query: '',
      sort: 'default',
      featured: !filters.featured && !filtered,
    })
  }
  function searchSubmit() {
    headingRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
    headingRef.current?.focus({ preventScroll: true })
  }
  return {
    filters,
    setFilters,
    headingRef,
    activeId,
    selectCategory,
    changeQuery,
    home,
    reset,
    toggleFeatured,
    searchSubmit,
  }
}
