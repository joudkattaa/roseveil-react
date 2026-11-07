import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createStorefrontAdapter } from './storefrontAdapter.ts'
import { StorefrontContext } from './storefront.context.ts'
import { createThemeStorage } from '../theme/themeStorage.ts'

interface StorefrontProviderProps {
  children: ReactNode
}

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

export default function StorefrontProvider({
  children,
}: StorefrontProviderProps) {
  // StrictMode can check this initializer twice; discarded candidates are inert.
  // Only the committed adapter is provided, subscribed and used for requests.
  const [adapter] = useState(() =>
    createStorefrontAdapter({
      query: developmentQuery(),
      storage: createThemeStorage(),
    }),
  )
  useEffect(() => {
    const release = adapter.retainCatalog()
    void adapter.actions.loadCatalog()
    return release
  }, [adapter])
  return <StorefrontContext value={adapter}>{children}</StorefrontContext>
}
