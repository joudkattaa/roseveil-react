import type { Cart } from './modules/cart/cart.types.ts'
import type { Theme, Profile, StorageAdapter } from './modules/state/state.types.ts'

import { normalizeCart, productById } from './logic.ts'
import { getProducts } from './modules/products/products.api.ts'
import type { Product } from './modules/products/products.types.ts'
import { ApiError } from './shared/api/client.ts'

// All persistent state lives here; no document/window UI access is allowed.
function browserStorage(): StorageAdapter | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function createState(storage: StorageAdapter | undefined = browserStorage()) {
  const cartKey = 'roseveil-shopping-bag-v1'
  const legacyKey = 'lumiere-shopping-bag-v1'
  const themeKey = 'roseveil-theme'
  let cart: Cart = []
  let promoCode = ''
  let theme: Theme = 'light'
  let profile: Profile | null = null
  let catalogProducts: Product[] = []
  let catalogProductsStatus: 'idle' | 'loading' | 'ready' | 'error' = 'idle'
  let catalogProductsError: ApiError | null = null
  const catalogProductListeners = new Set<() => void>()
  const notifyCatalogProducts = () => catalogProductListeners.forEach((listener) => listener())
  try {
    const saved: unknown = JSON.parse(
      storage?.getItem(cartKey) ?? storage?.getItem(legacyKey) ?? '{}',
    )
    if (typeof saved === 'object' && saved !== null) {
      cart = normalizeCart('items' in saved ? saved.items : undefined)
      promoCode = 'promoCode' in saved && saved.promoCode === 'GLOW20' ? 'GLOW20' : ''
    }
  } catch {
    /* Invalid or unavailable storage leaves an empty bag. */
  }
  try {
    theme = storage?.getItem(themeKey) === 'dark' ? 'dark' : 'light'
  } catch {
    /* Default light. */
  }
  function saveCart() {
    try {
      storage?.setItem(cartKey, JSON.stringify({ items: cart, promoCode }))
    } catch {
      /* In-memory fallback. */
    }
  }
  return {
    subscribeCatalogProducts(listener: () => void) {
      catalogProductListeners.add(listener)
      return () => catalogProductListeners.delete(listener)
    },
    get catalogProducts() {
      return catalogProducts.map((product) => ({ ...product }))
    },
    get catalogProductsStatus() {
      return catalogProductsStatus
    },
    get catalogProductsError() {
      return catalogProductsError
    },
    async loadCatalogProducts(fetcher: typeof fetch = globalThis.fetch, query = '') {
      if (catalogProductsStatus === 'loading') return
      catalogProductsStatus = 'loading'
      catalogProductsError = null
      notifyCatalogProducts()
      try {
        catalogProducts = await getProducts(fetcher, query)
        if (catalogProducts.length) cart = normalizeCart(cart, catalogProducts)
        catalogProductsStatus = 'ready'
      } catch (cause) {
        catalogProductsError =
          cause instanceof ApiError
            ? cause
            : new ApiError('The ROSEVEIL catalog could not be loaded.', 0, { cause })
        catalogProductsStatus = 'error'
      }
      notifyCatalogProducts()
    },
    get cart() {
      return cart.map((item) => ({ ...item }))
    },
    get promoCode() {
      return promoCode
    },
    get theme() {
      return theme
    },
    get profile() {
      return profile ? { ...profile } : null
    },
    addProduct(id: string) {
      if (!productById(id, catalogProducts)) return false
      const item = cart.find((line) => line.id === id)
      if (item?.quantity === 99) return false
      if (item) item.quantity++
      else cart.push({ id, quantity: 1 })
      saveCart()
      return true
    },
    changeQuantity(id: string, delta: number) {
      if (!Number.isInteger(delta)) return
      const item = cart.find((line) => line.id === id)
      if (!item) return
      item.quantity = Math.min(99, item.quantity + delta)
      cart = cart.filter((line) => line.quantity > 0)
      saveCart()
    },
    removeProduct(id: string) {
      cart = cart.filter((line) => line.id !== id)
      saveCart()
    },
    setPromoCode(value: string) {
      promoCode = value === 'GLOW20' ? 'GLOW20' : ''
      saveCart()
    },
    clearCart() {
      cart = []
      promoCode = ''
      saveCart()
    },
    setProfile(value: Profile | null) {
      profile = value ? { name: value.name } : null
    },
    setTheme(value: string) {
      theme = value === 'dark' ? 'dark' : 'light'
      try {
        storage?.setItem(themeKey, theme)
      } catch {
        /* In-memory fallback. */
      }
    },
  }
}
