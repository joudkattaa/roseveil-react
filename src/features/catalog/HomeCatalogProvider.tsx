import type { ReactNode } from 'react'
import { useCatalogNavigation } from './useCatalogNavigation.ts'
import { HomeCatalogContext } from './homeCatalog.context.ts'
interface HomeCatalogProviderProps {
  children: ReactNode
}
export default function HomeCatalogProvider({
  children,
}: HomeCatalogProviderProps) {
  const catalog = useCatalogNavigation()
  return <HomeCatalogContext value={catalog}>{children}</HomeCatalogContext>
}
