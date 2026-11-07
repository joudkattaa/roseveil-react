import { useEffect, useRef } from 'react'
import type { DemoOrder } from './checkout.logic.ts'
import OrderSummary from './OrderSummary.tsx'

interface DemoOrderConfirmationProps {
  order: DemoOrder
  onContinue: () => void
}

export default function DemoOrderConfirmation({
  order,
  onContinue,
}: DemoOrderConfirmationProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  return (
    <div className="checkout-step">
      <h3 ref={heading} tabIndex={-1}>
        Demo order confirmed
      </h3>
      <p className="checkout-note">
        This was a demo only. No payment was collected, no real order was placed
        and no shipping request was made. Your customer details were not saved
        or sent. Your shopping bag is now empty.
      </p>
      <OrderSummary order={order} />
      <button type="button" className="button" onClick={onContinue}>
        Continue shopping
      </button>
    </div>
  )
}
