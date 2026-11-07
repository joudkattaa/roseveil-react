import { createContext } from 'react'
import { useContext } from 'react'
import type { useCatalogNavigation } from './useCatalogNavigation.ts'
export const HomeCatalogContext = createContext<ReturnType<
  typeof useCatalogNavigation
> | null>(null)
export function useHomeCatalog() {
  const catalog = useContext(HomeCatalogContext)
  if (!catalog) throw new Error('Home catalog requires HomeCatalogProvider.')
  return catalog
}
