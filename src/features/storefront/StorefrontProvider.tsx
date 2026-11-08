import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createStorefrontAdapter } from './storefrontAdapter.ts'
import { StorefrontContext } from './storefront.context.ts'
import { catalogScenarioFromPath } from '../catalog/api/catalogScenarios.ts'
import { createThemeStorage } from '../theme/themeStorage.ts'

// Components that receive the shared store.
interface StorefrontProviderProps {
  children: ReactNode
}

// Read API test options during development.
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
  // Keep the same adapter across renders.
  // StrictMode may run the initializer twice but uses one adapter.
  const [adapter] = useState(() =>
    createStorefrontAdapter({
      query: developmentQuery(),

      // Choose the API test scenario.
      scenario:
        import.meta.env.DEV && typeof window !== 'undefined'
          ? catalogScenarioFromPath(window.location.pathname)
          : undefined,

      // Set up theme storage.
      storage: createThemeStorage(),
    }),
  )

  // Load products and release ownership when the provider unmounts.
  useEffect(() => {
    const release = adapter.retainCatalog()
    void adapter.actions.loadCatalog()
    return release
  }, [adapter])

  // Share the same store and bag with every page.
  return <StorefrontContext value={adapter}>{children}</StorefrontContext>
}
