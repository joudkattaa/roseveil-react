import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useCatalogNavigation } from '../src/features/catalog/useCatalogNavigation.ts'
import { useNotification } from '../src/shared/ui/useNotification.ts'

it('preserves combined filters and the distinct Home and Clear Filters defaults', () => {
  const { result } = renderHook(() => useCatalogNavigation())
  act(() => result.current.changeQuery('rose'))
  act(() =>
    result.current.setFilters((current) => ({
      ...current,
      sort: 'price-desc',
    })),
  )
  act(() => result.current.selectCategory('Skin Care'))
  expect(result.current.filters).toEqual({
    category: 'Skin Care',
    query: 'rose',
    sort: 'price-desc',
    featured: false,
  })
  act(() => result.current.reset())
  expect(result.current.filters).toEqual({
    category: 'All',
    query: '',
    sort: 'default',
    featured: false,
  })
  act(() => result.current.home())
  expect(result.current.filters.featured).toBe(true)
  expect(result.current.activeId).toBe('home')
  act(() => result.current.toggleFeatured())
  expect(result.current.filters.featured).toBe(false)
})

it('restarts feedback timing and cleans its timer on unmount', () => {
  vi.useFakeTimers()
  try {
    const { result, unmount } = renderHook(() => useNotification())
    act(() => result.current.notify('First'))
    act(() => vi.advanceTimersByTime(3000))
    act(() => result.current.notify('Second'))
    act(() => vi.advanceTimersByTime(800))
    expect(result.current.notification).toEqual({
      message: 'Second',
      revision: 2,
    })
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.notification.message).toBe('')
    act(() => result.current.notify('Third'))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  } finally {
    vi.useRealTimers()
  }
})
