import { useRef } from 'react'
import type { StorefrontSnapshot } from '../storefront/storefrontAdapter.ts'
import { cartTotals, formatMoney, productById } from '../../logic.ts'
import CartRow from './CartRow.tsx'
import PromoForm from './PromoForm.tsx'

interface ShoppingBagProps {
  snapshot: StorefrontSnapshot
  onQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onPromo: (code: string) => void
  onContinue: () => void
  onRetry: () => Promise<void>
}

export default function ShoppingBag({
  snapshot,
  onQuantity,
  onRemove,
  onClear,
  onPromo,
  onContinue,
  onRetry,
}: ShoppingBagProps) {
  const content = useRef<HTMLDivElement>(null)
  const available =
    snapshot.phase === 'ready' &&
    snapshot.catalog.length > 0 &&
    snapshot.cart.every((item) => productById(item.id, snapshot.catalog))
  const totals = available
    ? cartTotals(snapshot.cart, snapshot.promoCode, snapshot.catalog)
    : null
  function restore() {
    content.current?.focus({ preventScroll: true })
  }
  return (
    <div ref={content} tabIndex={-1} id="cart-content">
      {!snapshot.cart.length ? (
        <div className="cart-empty">
          <h3>Your next little luxury awaits.</h3>
          <p>Your shopping bag is empty. Find something you’ll love.</p>
          <button className="button" type="button" onClick={onContinue}>
            EXPLORE THE COLLECTION
          </button>
        </div>
      ) : (
        <>
          {!available ? (
            <div role="status">
              <p>
                Product prices are unavailable. Your saved bag is safe. Please
                retry loading the collection.
              </p>
              <button
                className="button"
                type="button"
                disabled={snapshot.phase === 'loading'}
                onClick={() => {
                  void onRetry()
                }}
              >
                Try again
              </button>
            </div>
          ) : totals ? (
            <p className="shipping-note">
              {totals.merchandise > 5000
                ? 'Lovely! Your bag qualifies for free shipping.'
                : `Add ${formatMoney(5001 - totals.merchandise)} more after discounts for free shipping.`}
            </p>
          ) : null}
          <ul className="cart-lines">
            {snapshot.cart.map((item) => (
              <CartRow
                key={item.id}
                id={item.id}
                product={productById(item.id, snapshot.catalog)}
                quantity={item.quantity}
                pricesAvailable={available}
                onQuantity={onQuantity}
                onRemove={onRemove}
                onRowRemoved={restore}
              />
            ))}
          </ul>
          <button
            className="cart-clear"
            type="button"
            onClick={() => {
              onClear()
              restore()
            }}
          >
            Clear Bag
          </button>
          <PromoForm appliedCode={snapshot.promoCode} onApply={onPromo} />
          {totals ? (
            <div className="cart-totals">
              <div>
                <span>Subtotal</span>
                <span>{formatMoney(totals.subtotal)}</span>
              </div>
              {totals.discount ? (
                <div>
                  <span>GLOW20 · 20% off</span>
                  <span>−{formatMoney(totals.discount)}</span>
                </div>
              ) : null}
              <div>
                <span>Demo shipping</span>
                <span>
                  {totals.shipping ? formatMoney(totals.shipping) : 'FREE'}
                </span>
              </div>
              <div className="grand-total">
                <span>Total</span>
                <span>{formatMoney(totals.total)}</span>
              </div>
            </div>
          ) : null}
          <button
            className="button cart-checkout"
            type="button"
            disabled
            aria-describedby="checkout-unavailable"
          >
            DEMO CHECKOUT
          </button>
          <p id="checkout-unavailable" className="cart-demo">
            Checkout is not implemented. No payment is collected or real order
            placed.
          </p>
          <button className="text-button" type="button" onClick={onContinue}>
            Continue shopping
          </button>
        </>
      )}
    </div>
  )
}
