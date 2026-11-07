import { createState } from '../../state.ts'
import type { Product } from '../../modules/products/products.types.ts'
import type { CartItem } from '../../modules/cart/cart.types.ts'
import type {
  Profile,
  StorageAdapter,
  Theme,
} from '../../modules/state/state.types.ts'
import type { CatalogFailure, CatalogPhase } from '../../types/ui.types.ts'

export interface StorefrontSnapshot {
  readonly catalog: readonly Readonly<Product>[]
  readonly phase: CatalogPhase
  readonly error: Readonly<CatalogFailure> | null
  readonly cart: readonly Readonly<CartItem>[]
  readonly promoCode: string
  readonly theme: Theme
  readonly profile: Readonly<Profile> | null
}

interface StorefrontActions {
  loadCatalog: () => Promise<void>
  addProduct: (id: string) => boolean
  changeQuantity: (id: string, delta: number) => void
  removeProduct: (id: string) => void
  setPromoCode: (value: string) => void
  clearCart: () => void
  setProfile: (value: Readonly<Profile> | null) => void
  setTheme: (value: Theme) => void
}

export interface StorefrontAdapter {
  readonly actions: Readonly<StorefrontActions>
  getSnapshot: () => StorefrontSnapshot
  subscribe: (listener: () => void) => () => void
}

interface StorefrontOptions {
  readonly storage?: StorageAdapter
  readonly fetcher?: typeof fetch
  readonly query?: string
}

export function createStorefrontAdapter(
  options: StorefrontOptions = {},
): StorefrontAdapter {
  const state = createState(options.storage)
  const fetcher = options.fetcher ?? globalThis.fetch
  const query = options.query ?? ''
  const listeners = new Set<() => void>()
  let detach: (() => void) | undefined

  function readSnapshot(): StorefrontSnapshot {
    const error = state.catalogProductsError
    const profile = state.profile
    return Object.freeze({
      catalog: Object.freeze(
        state.catalogProducts.map((product) => Object.freeze({ ...product })),
      ),
      phase: state.catalogProductsStatus,
      error: error
        ? Object.freeze({ message: error.message, status: error.status })
        : null,
      cart: Object.freeze(state.cart.map((item) => Object.freeze({ ...item }))),
      promoCode: state.promoCode,
      theme: state.theme,
      profile: profile ? Object.freeze({ ...profile }) : null,
    })
  }

  let snapshot = readSnapshot()
  function publish() {
    const next = readSnapshot()
    // Domain snapshots contain scalar records only. Keep identity for no-op writes.
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  const actions: Readonly<StorefrontActions> = Object.freeze({
    async loadCatalog() {
      const pending = state.loadCatalogProducts(fetcher, query)
      publish()
      await pending
      publish()
    },
    addProduct(id: string) {
      if (
        state.catalogProductsStatus !== 'ready' ||
        !state.catalogProducts.length
      )
        return false
      const added = state.addProduct(id)
      publish()
      return added
    },
    changeQuantity(id: string, delta: number) {
      state.changeQuantity(id, delta)
      publish()
    },
    removeProduct(id: string) {
      state.removeProduct(id)
      publish()
    },
    setPromoCode(value: string) {
      state.setPromoCode(value)
      publish()
    },
    clearCart() {
      state.clearCart()
      publish()
    },
    setProfile(value: Readonly<Profile> | null) {
      state.setProfile(value ? { ...value } : null)
      publish()
    },
    setTheme(value: Theme) {
      state.setTheme(value)
      publish()
    },
  })

  return {
    actions,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      // Each registration owns its cleanup, even when callbacks are reused.
      const subscription = () => listener()
      if (!detach) {
        const unsubscribe = state.subscribeCatalogProducts(publish)
        detach = () => {
          unsubscribe()
        }
      }
      listeners.add(subscription)
      publish()
      return () => {
        listeners.delete(subscription)
        if (!listeners.size) {
          detach?.()
          detach = undefined
        }
      }
    },
  }
}
