import { useState, type RefObject } from 'react'
import { productById } from '../../logic.ts'
import type {
  StorefrontAdapter,
  StorefrontSnapshot,
} from '../storefront/storefrontAdapter.ts'

import { checkoutOrder, type DemoOrder } from '../checkout/checkout.logic.ts'

export type ActiveDialog =
  | null
  | { kind: 'bag'; focusOnMount?: boolean }
  | { kind: 'product'; id: string }
  | { kind: 'checkout' }
  | { kind: 'confirmation'; order: DemoOrder }

export function useShoppingBag(
  snapshot: StorefrontSnapshot,
  actions: StorefrontAdapter['actions'],
  notify: (message: string) => void,
  headingRef: RefObject<HTMLHeadingElement | null>,
) {
  const [bagFeedback, setBagFeedback] = useState(0)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const selectedProduct =
    activeDialog?.kind === 'product'
      ? productById(activeDialog.id, snapshot.catalog)
      : undefined
  const bagCount = snapshot.cart.reduce((sum, item) => sum + item.quantity, 0)
  function addProduct(id: string) {
    const product = productById(id, snapshot.catalog)
    if (!product || snapshot.phase !== 'ready') {
      notify('Products are unavailable. Please reload the collection.')
      return
    }
    const added = actions.addProduct(id)
    if (added) setBagFeedback((current) => current + 1)
    notify(
      added
        ? product.name + ' added to your bag.'
        : 'You have reached the limit of 99 for this item.',
    )
  }
  function continueShopping() {
    setActiveDialog(null)
    headingRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  function changeQuantity(id: string, delta: number) {
    const item = snapshot.cart.find((line) => line.id === id)
    if (!item || !Number.isInteger(delta)) return
    const quantity = Math.min(99, item.quantity + delta)
    if (quantity === item.quantity) return
    const name = productById(id, snapshot.catalog)?.name ?? 'Product'
    actions.changeQuantity(id, delta)
    notify(
      quantity > 0
        ? name + ' quantity updated to ' + quantity + '.'
        : name + ' removed from your bag.',
    )
  }
  function removeProduct(id: string) {
    if (!snapshot.cart.some((line) => line.id === id)) return
    const name = productById(id, snapshot.catalog)?.name ?? 'Product'
    actions.removeProduct(id)
    notify(name + ' removed from your bag.')
  }
  function clearBag() {
    actions.clearCart()
    notify('Shopping bag cleared.')
  }
  function beginCheckout() {
    if (!checkoutOrder(snapshot)) return
    setActiveDialog({ kind: 'checkout' })
  }
  function backToBag() {
    setActiveDialog({ kind: 'bag', focusOnMount: true })
  }
  function confirmCheckout() {
    // Recheck the current snapshot at submission; never authorize stale prices.
    if (activeDialog?.kind !== 'checkout') return
    const order = checkoutOrder(snapshot)
    if (!order) return
    setActiveDialog({ kind: 'confirmation', order })
    actions.clearCart()
  }
  return {
    bagFeedback,
    beginCheckout,
    backToBag,
    confirmCheckout,
    changeQuantity,
    removeProduct,
    clearBag,
    activeDialog,
    setActiveDialog,
    selectedProduct,
    bagCount,
    addProduct,
    continueShopping,
  }
}
