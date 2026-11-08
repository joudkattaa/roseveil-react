import { useContext, useSyncExternalStore } from 'react'
import { StorefrontContext } from './storefront.context.ts'

export function useStorefront() {
  const adapter = useContext(StorefrontContext)
  if (adapter === null) {
    throw new Error('useStorefront must be used inside StorefrontProvider.')
  }
  // Update the component when store data changes.
  const snapshot = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  )
  // Return the current data and store actions.
  return {
    snapshot,
    actions: adapter.actions,
    getSnapshot: adapter.getSnapshot,
  }
}
