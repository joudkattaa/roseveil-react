import { useOutletContext } from 'react-router'
import type { useCatalogNavigation } from '../catalog/useCatalogNavigation.ts'
import type { useShoppingBag } from '../cart/useShoppingBag.ts'

export interface StorefrontUi {
  catalog: ReturnType<typeof useCatalogNavigation>
  bag: ReturnType<typeof useShoppingBag>
}

export function useStorefrontUi() {
  const context = useOutletContext<StorefrontUi | undefined>()
  if (!context) throw new Error('Page must be rendered inside RootLayout.')
  return context
}
