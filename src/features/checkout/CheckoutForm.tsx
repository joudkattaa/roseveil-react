import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutValues } from './checkout.schema.ts'
import { Field } from '../../shared/ui/shadcn/Field.tsx'
import { FieldLabel } from '../../shared/ui/shadcn/FieldLabel.tsx'
import { FieldError } from '../../shared/ui/shadcn/FieldError.tsx'
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
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: '', email: '', phone: '', address: '' },
    shouldFocusError: true,
  })
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
        noValidate
        onSubmit={form.handleSubmit(() => {
          if (order) onConfirm()
        })}
      >
        <fieldset disabled={!order}>
          <legend>Demo customer details</legend>
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-name">Full name</FieldLabel>
                <input
                  {...field}
                  id="checkout-name"
                  type="text"
                  aria-required="true"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'checkout-name-error' : undefined
                  }
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="checkout-name-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
                <input
                  {...field}
                  id="checkout-email"
                  type="email"
                  aria-required="true"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'checkout-email-error' : undefined
                  }
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="checkout-email-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-phone">Phone number</FieldLabel>
                <input
                  {...field}
                  id="checkout-phone"
                  type="tel"
                  aria-required="true"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'checkout-phone-error' : undefined
                  }
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="checkout-phone-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-address">
                  Shipping address
                </FieldLabel>
                <textarea
                  {...field}
                  id="checkout-address"
                  rows={3}
                  aria-required="true"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'checkout-address-error' : undefined
                  }
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="checkout-address-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
        </fieldset>
        <div className="checkout-actions">
          <button className="button secondary" type="button" onClick={onBack}>
            Back to shopping bag
          </button>
          <button
            className="button"
            type="submit"
            disabled={!order || form.formState.isSubmitting}
          >
            Confirm demo order
          </button>
        </div>
      </form>
    </div>
  )
}
