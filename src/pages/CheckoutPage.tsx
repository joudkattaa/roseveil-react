import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PageFrame from '../shared/ui/PageFrame.tsx'
import CheckoutForm from '../features/checkout/CheckoutForm.tsx'
import DemoOrderConfirmation from '../features/checkout/DemoOrderConfirmation.tsx'
import {
  checkoutOrder,
  type DemoOrder,
} from '../features/checkout/checkout.logic.ts'
import { useStorefront } from '../features/storefront/useStorefront.ts'
export default function CheckoutPage() {
  const { snapshot, actions } = useStorefront()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState<DemoOrder | null>(null)
  function confirm() {
    const order = checkoutOrder(snapshot)
    if (!order) return
    setConfirmed(order)
    actions.clearCart()
  }
  return (
    <PageFrame title="Demo Checkout">
      {confirmed ? (
        <DemoOrderConfirmation
          order={confirmed}
          onContinue={() => navigate('/shop')}
        />
      ) : snapshot.cart.length === 0 ? (
        <>
          <p>Your shopping bag is empty.</p>
          <Link className="button" to="/shop">
            Explore the collection
          </Link>
        </>
      ) : (
        <CheckoutForm
          order={checkoutOrder(snapshot)}
          onBack={() => navigate('/bag')}
          onConfirm={confirm}
        />
      )}
    </PageFrame>
  )
}
