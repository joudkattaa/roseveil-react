import { useEffect, useState, useSyncExternalStore } from 'react'
import { createStorefrontAdapter } from './storefrontAdapter.ts'

import { createThemeStorage } from '../theme/themeStorage.ts'

function developmentQuery(): string {
  const params = new URLSearchParams()
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const page = new URLSearchParams(window.location.search)
    for (const key of ['delay', 'error', 'empty']) {
      const value = page.get(`api-${key}`)
      if (value) params.set(key, value)
    }
  }
  return params.size ? `?${params}` : ''
}

export function useStorefront() {
  const [adapter] = useState(() =>
    createStorefrontAdapter({
      query: developmentQuery(),
      storage: createThemeStorage(),
    }),
  )
  const snapshot = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  )
  useEffect(() => {
    void adapter.actions.loadCatalog()
  }, [adapter])
  return { snapshot, actions: adapter.actions }
}
