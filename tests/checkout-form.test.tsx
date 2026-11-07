import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import CheckoutForm from '../src/features/checkout/CheckoutForm.tsx'
import { checkoutSchema } from '../src/features/checkout/checkout.schema.ts'
import { checkoutOrder } from '../src/features/checkout/checkout.logic.ts'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'
import { products } from '../server/catalog.ts'

async function order() {
  const store = createStorefrontAdapter({
    fetcher: async () => Response.json({ items: products }),
  })
  await store.actions.loadCatalog()
  store.actions.addProduct('body-cream')
  return checkoutOrder(store.getSnapshot())
}
it('shows linked field errors, focuses the first invalid field, and keeps customer values local', async () => {
  const confirm = vi.fn()
  const user = userEvent.setup()
  render(
    <CheckoutForm order={await order()} onBack={vi.fn()} onConfirm={confirm} />,
  )
  await user.type(screen.getByLabelText('Full name'), '   ')
  await user.type(screen.getByLabelText('Email'), 'bad-email')
  await user.type(screen.getByLabelText('Phone number'), 'abcdefg')
  await user.type(screen.getByLabelText('Shipping address'), 'short')
  await user.click(screen.getByRole('button', { name: 'Confirm demo order' }))
  await screen.findByText('Enter your full name (at least 2 characters).')
  expect(screen.getByLabelText('Full name')).toHaveFocus()
  expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
    'Enter a valid email address.',
  )
  expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
    'Use numbers and common phone symbols only.',
  )
  expect(screen.getByLabelText('Shipping address')).toHaveAccessibleDescription(
    'Enter a shipping address (at least 8 characters).',
  )
  expect(screen.getAllByRole('alert')).toHaveLength(4)
  expect(confirm).not.toHaveBeenCalled()
  expect(document.querySelectorAll('[data-slot="field"]')).toHaveLength(4)
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).not.toContain(
    'bad-email',
  )
})
it('supports keyboard-only completion and confirmation', async () => {
  const confirm = vi.fn()
  const user = userEvent.setup()
  render(
    <CheckoutForm order={await order()} onBack={vi.fn()} onConfirm={confirm} />,
  )
  expect(
    screen.getByRole('heading', { name: 'Customer information' }),
  ).toHaveFocus()
  await user.tab()
  expect(screen.getByLabelText('Full name')).toHaveFocus()
  await user.keyboard(
    'Demo Customer{Tab}demo@example.com{Tab}1234567890{Tab}123 Sample Street{Tab}',
  )
  expect(
    screen.getByRole('button', { name: 'Back to shopping bag' }),
  ).toHaveFocus()
  await user.tab()
  expect(
    screen.getByRole('button', { name: 'Confirm demo order' }),
  ).toHaveFocus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1))
  expect(confirm.mock.calls[0]).toEqual([])
})
it('blocks programmatic submission while current prices or the bag are unavailable', async () => {
  const confirm = vi.fn()
  render(<CheckoutForm order={null} onBack={vi.fn()} onConfirm={confirm} />)
  expect(
    screen.getByRole('button', { name: 'Confirm demo order' }),
  ).toBeDisabled()
  expect(screen.getByLabelText('Full name')).toBeDisabled()
  fireEvent.submit(screen.getByRole('form', { name: 'Demo checkout' }))
  await waitFor(() => expect(confirm).not.toHaveBeenCalled())
})
it('keeps lengths and phone/email checks in one Zod schema', () => {
  const valid = {
    fullName: 'Demo Customer',
    email: 'demo@example.com',
    phone: '+90 (555) 123-4567',
    address: '123 Sample Street',
  }
  expect(checkoutSchema.safeParse(valid).success).toBe(true)
  for (const values of [
    { ...valid, fullName: 'x'.repeat(101) },
    { ...valid, email: 'x'.repeat(255) + '@example.com' },
    { ...valid, phone: '1'.repeat(31) },
    { ...valid, phone: '-------' },
    { ...valid, address: 'x'.repeat(501) },
    { ...valid, address: '        ' },
  ])
    expect(checkoutSchema.safeParse(values).success).toBe(false)
})
