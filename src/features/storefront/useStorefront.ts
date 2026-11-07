import { useContext, useSyncExternalStore } from 'react'
import { StorefrontContext } from './storefront.context.ts'

export function useStorefront() {
  const adapter = useContext(StorefrontContext)
  if (adapter === null) {
    throw new Error('useStorefront must be used inside StorefrontProvider.')
  }
  const snapshot = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  )
  return { snapshot, actions: adapter.actions }
}
