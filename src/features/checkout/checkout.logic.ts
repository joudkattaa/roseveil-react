import { cartTotals, productById } from '../../logic.ts'
import type { CartTotals } from '../../modules/cart/cart.types.ts'
import type { StorefrontSnapshot } from '../storefront/storefrontAdapter.ts'

export interface DemoOrder {
  readonly items: readonly {
    readonly id: string
    readonly name: string
    readonly quantity: number
    readonly price: number
  }[]
  readonly totals: Readonly<CartTotals>
}

export function checkoutOrder(snapshot: StorefrontSnapshot): DemoOrder | null {
  if (
    snapshot.phase !== 'ready' ||
    snapshot.cart.length === 0 ||
    snapshot.catalog.length === 0
  )
    return null
  const items: DemoOrder['items'][number][] = []
  for (const item of snapshot.cart) {
    const product = productById(item.id, snapshot.catalog)
    if (
      !product ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )
      return null
    items.push({
      id: item.id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
    })
  }
  return {
    items,
    totals: cartTotals(snapshot.cart, snapshot.promoCode, snapshot.catalog),
  }
}
