import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import ProductCard from '../src/features/catalog/ProductCard.tsx'
import ProductDetails from '../src/features/catalog/ProductDetails.tsx'
import { products } from '../server/catalog.ts'
import { formatMoney } from '../src/logic.ts'

const product = products.find((item) => item.id === 'body-cream')
if (!product) throw new Error('Original product fixture missing')
function CurrentPage() {
  const { pathname } = useLocation()
  return <output aria-label="Product destination">{pathname}</output>
}
it('shows actual card price and size and keeps keyboard product navigation and bag actions', async () => {
  const onAdd = vi.fn()
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <ProductCard product={product} onAdd={onAdd} />
      <CurrentPage />
    </MemoryRouter>,
  )
  const card = screen.getByRole('article', { name: product.name })
  expect(within(card).getByText(product.size)).toBeInTheDocument()
  expect(within(card).getByText(formatMoney(product.price))).toBeInTheDocument()
  expect(within(card).getByRole('img', { name: product.name })).toHaveAttribute(
    'src',
    '/roseveil/' + product.image + '.webp',
  )
  const link = within(card).getByRole('link', { name: 'View ' + product.name })
  link.focus()
  await user.keyboard('{Enter}')
  expect(screen.getByLabelText('Product destination')).toHaveTextContent(
    '/products/' + product.id,
  )
  await user.click(
    within(card).getByRole('button', {
      name: 'Add ' + product.name + ' to bag',
    }),
  )
  expect(onAdd).toHaveBeenCalledWith(product.id)
})
it('shows original details, real shopping terms and a working bag link without fake claims', async () => {
  const onAdd = vi.fn()
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <ProductDetails product={product} available onAdd={onAdd} />
      <CurrentPage />
    </MemoryRouter>,
  )
  expect(screen.getByText(product.description)).toBeInTheDocument()
  expect(screen.getByText(product.size)).toBeInTheDocument()
  expect(screen.getByText(/USD/).closest('p')).toHaveTextContent(
    formatMoney(product.price),
  )
  const add = screen.getByRole('button', { name: 'ADD TO BAG' })
  add.focus()
  await user.keyboard('{Enter}')
  expect(onAdd).toHaveBeenCalledWith(product.id)
  const delivery = screen.getByText('Delivery & demo checkout')
  await user.click(delivery)
  expect(delivery.closest('details')).toHaveAttribute('open')
  expect(screen.getByText(/Demo shipping is \$5.95/)).toHaveTextContent(
    'after discounts is over $50',
  )
  await user.click(screen.getByRole('link', { name: 'View shopping bag' }))
  expect(screen.getByLabelText('Product destination')).toHaveTextContent('/bag')
})
it('does not present stale prices or enable additions when current prices are unavailable', async () => {
  const onAdd = vi.fn()
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <ProductDetails product={product} available={false} onAdd={onAdd} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'Current price unavailable',
  )
  expect(screen.queryByText(/USD/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'ADD TO BAG' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'ADD TO BAG' }))
  expect(onAdd).not.toHaveBeenCalled()
})
