import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../src/App.tsx'
import { products } from '../server/catalog.ts'

function catalog() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ items: products })),
  )
}

it('restores bag and promo after remount, clears them and restores focus when closed', async () => {
  catalog()
  const user = userEvent.setup()
  const view = render(<App />)
  await user.click(
    await screen.findByRole('button', { name: 'Add Velvet Body Cream to bag' }),
  )
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
  )
  let dialog = within(screen.getByRole('dialog'))
  await user.type(
    dialog.getByLabelText('Have a little treat? Enter your code.'),
    'bad',
  )
  await user.click(dialog.getByRole('button', { name: 'APPLY' }))
  expect(
    dialog.getByText('That code is not available. Try GLOW20.'),
  ).toBeInTheDocument()
  await user.clear(
    dialog.getByLabelText('Have a little treat? Enter your code.'),
  )
  await user.type(
    dialog.getByLabelText('Have a little treat? Enter your code.'),
    ' glow20 ',
  )
  await user.click(dialog.getByRole('button', { name: 'APPLY' }))
  await user.click(
    dialog.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 2 items' }),
  ).toBeInTheDocument()
  expect(dialog.getByText('$50.73')).toBeInTheDocument()
  view.unmount()
  render(<App />)
  await screen.findByRole('button', { name: 'Add Velvet Body Cream to bag' })
  const opener = screen.getByRole('button', {
    name: 'Open shopping bag, 2 items',
  })
  await user.click(opener)
  dialog = within(screen.getByRole('dialog'))
  expect(
    dialog.getByLabelText('Quantity of Velvet Body Cream'),
  ).toHaveTextContent('2')
  expect(dialog.getByText('$50.73')).toBeInTheDocument()
  expect(dialog.getByRole('button', { name: 'REMOVE' })).toBeInTheDocument()
  expect(dialog.getByRole('button', { name: 'DEMO CHECKOUT' })).toBeEnabled()
  await user.click(dialog.getByRole('button', { name: 'Clear Bag' }))
  expect(
    dialog.getByText('Your next little luxury awaits.'),
  ).toBeInTheDocument()
  expect(
    dialog.getByRole('group', { name: 'Shopping bag contents' }),
  ).toHaveFocus()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toBe(
    JSON.stringify({ items: [], promoCode: '' }),
  )
  fireEvent(
    screen.getByRole('dialog'),
    new Event('cancel', { cancelable: true }),
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
  expect(opener).toHaveAccessibleName('Open shopping bag, 0 items')
})

it('enforces 99, keeps decrease available and focuses the bag when the last row is removed', async () => {
  catalog()
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'body-cream', quantity: 98 }],
      promoCode: '',
    }),
  )
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('button', { name: 'Add Velvet Body Cream to bag' })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 98 items' }),
  )
  const dialog = within(screen.getByRole('dialog'))
  await user.click(
    dialog.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  )
  expect(
    dialog.getByRole('button', {
      name: 'Increase quantity of Velvet Body Cream',
    }),
  ).toBeDisabled()
  const decrease = dialog.getByRole('button', {
    name: 'Decrease quantity of Velvet Body Cream',
  })
  expect(decrease).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(
    dialog.getByLabelText('Quantity of Velvet Body Cream'),
  ).toHaveTextContent('98')
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 98 items' }),
  ).toBeInTheDocument()
  await user.click(
    dialog.getByRole('button', { name: 'Remove Velvet Body Cream' }),
  )
  expect(
    dialog.getByRole('group', { name: 'Shopping bag contents' }),
  ).toHaveFocus()
  expect(
    dialog.getByText('Your next little luxury awaits.'),
  ).toBeInTheDocument()
})

it('decreases the last item to zero without leaving focus on a removed button', async () => {
  catalog()
  localStorage.setItem(
    'roseveil-shopping-bag-v1',
    JSON.stringify({
      items: [{ id: 'body-cream', quantity: 1 }],
      promoCode: '',
    }),
  )
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('button', { name: 'Add Velvet Body Cream to bag' })
  await user.click(
    screen.getByRole('button', { name: 'Open shopping bag, 1 items' }),
  )
  const dialog = within(screen.getByRole('dialog'))
  const decrease = dialog.getByRole('button', {
    name: 'Decrease quantity of Velvet Body Cream',
  })
  decrease.focus()
  await user.keyboard('{Enter}')
  expect(
    dialog.getByText('Your next little luxury awaits.'),
  ).toBeInTheDocument()
  expect(
    dialog.getByRole('group', { name: 'Shopping bag contents' }),
  ).toHaveFocus()
  expect(
    screen.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('roseveil-shopping-bag-v1')).toBe(
    JSON.stringify({ items: [], promoCode: '' }),
  )
})
