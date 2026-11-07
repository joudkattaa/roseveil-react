import { useEffect, useRef } from 'react'
import type { DemoOrder } from './checkout.logic.ts'
import OrderSummary from './OrderSummary.tsx'

interface CheckoutFormProps {
  order: DemoOrder | null
  onBack: () => void
  onConfirm: () => void
}

export default function CheckoutForm({
  order,
  onBack,
  onConfirm,
}: CheckoutFormProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  return (
    <div className="checkout-step">
      <h3 ref={heading} tabIndex={-1}>
        Customer information
      </h3>
      <p id="checkout-demo-note" className="checkout-note">
        Demo only. No real payment, real order or shipping request occurs. Your
        details are not saved or sent. Use sample details.
      </p>
      {order ? (
        <OrderSummary order={order} />
      ) : (
        <p role="alert">
          Checkout is unavailable. Go back to your bag and reload current
          product prices.
        </p>
      )}
      <form
        className="checkout-form"
        aria-label="Demo checkout"
        aria-describedby="checkout-demo-note"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault()
          if (!order || !event.currentTarget.reportValidity()) return
          onConfirm()
        }}
      >
        <fieldset disabled={!order}>
          <legend>Demo customer details</legend>
          <label htmlFor="checkout-name">Full name</label>
          <input
            id="checkout-name"
            name="fullName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            pattern=".*\S.*"
          />
          <label htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            required
            maxLength={254}
          />
          <label htmlFor="checkout-phone">Phone number</label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={30}
          />
          <label htmlFor="checkout-address">Shipping address</label>
          <textarea
            id="checkout-address"
            name="address"
            required
            minLength={8}
            maxLength={500}
            rows={3}
          />
        </fieldset>
        <div className="checkout-actions">
          <button className="button secondary" type="button" onClick={onBack}>
            Back to shopping bag
          </button>
          <button className="button" type="submit" disabled={!order}>
            Confirm demo order
          </button>
        </div>
      </form>
    </div>
  )
}
