import { describe, expect, it, vi } from 'vitest'
import { createStorefrontAdapter } from '../src/features/storefront/storefrontAdapter.ts'
import { products } from '../server/catalog.ts'
import { cartTotals, findProducts } from '../src/logic.ts'
import type { StorageAdapter } from '../src/modules/state/state.types.ts'

function memory(): StorageAdapter {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
}
const success = () => Promise.resolve(Response.json({ items: products }))

describe('protected business integration', () => {
  it('persists quantities and promo; removes, clears and reloads safely', async () => {
    const storage = memory()
    const store = createStorefrontAdapter({ storage, fetcher: success })
    await store.actions.loadCatalog()
    expect(store.actions.addProduct('serum')).toBe(true)
    store.actions.changeQuantity('serum', 1)
    store.actions.setPromoCode('GLOW20')
    const reload = createStorefrontAdapter({ storage, fetcher: success })
    await reload.actions.loadCatalog()
    expect(reload.getSnapshot().cart).toEqual([{ id: 'serum', quantity: 2 }])
    expect(reload.getSnapshot().promoCode).toBe('GLOW20')
    for (let i = 0; i < 110; i++) reload.actions.addProduct('serum')
    expect(reload.getSnapshot().cart[0]?.quantity).toBe(99)
    expect(reload.actions.addProduct('serum')).toBe(false)
    reload.actions.changeQuantity('serum', -99)
    expect(reload.getSnapshot().cart).toEqual([])
    reload.actions.addProduct('serum')
    reload.actions.removeProduct('serum')
    expect(reload.getSnapshot().cart).toEqual([])
    reload.actions.clearCart()
    expect(reload.getSnapshot().promoCode).toBe('')
  })
  it('rounds discounts and preserves the strict free-shipping boundary', () => {
    const base = products[0]
    if (!base) throw Error('Fixture missing')
    const catalog = [{ ...base, price: 6250 }]
    expect(
      cartTotals([{ id: base.id, quantity: 1 }], 'GLOW20', catalog),
    ).toMatchObject({
      discount: 1250,
      merchandise: 5000,
      shipping: 595,
      total: 5595,
    })
    expect(
      cartTotals([{ id: base.id, quantity: 1 }], '', [{ ...base, price: 5001 }])
        .shipping,
    ).toBe(0)
    expect(cartTotals([], '', catalog).total).toBe(0)
  })
  it('filters and sorts copied results without mutating the catalog', () => {
    const before = JSON.stringify(products)
    const matches = findProducts(
      'Skin Care',
      'SERUM',
      false,
      'price-desc',
      products,
    )
    expect(matches.length).toBeGreaterThan(0)
    expect(
      matches.every(
        (p) =>
          p.category === 'Skin Care' && p.name.toLowerCase().includes('serum'),
      ),
    ).toBe(true)
    expect(matches.map((p) => p.price)).toEqual(
      [...matches.map((p) => p.price)].sort((a, b) => b - a),
    )
    expect(
      findProducts('All', '', true, 'default', products).map((p) => p.id),
    ).toEqual(['body-cream', 'shampoo', 'serum', 'perfume', 'makeup'])
    expect(JSON.stringify(products)).toBe(before)
  })
  it('keeps frozen stable snapshots, blocks stale additions and retries', async () => {
    let fail = false
    const store = createStorefrontAdapter({
      fetcher: () => (fail ? Promise.reject(Error('offline')) : success()),
    })
    const listener = vi.fn()
    const off = store.subscribe(listener)
    await store.actions.loadCatalog()
    const snapshot = store.getSnapshot()
    expect(store.getSnapshot()).toBe(snapshot)
    expect(Object.isFrozen(snapshot.catalog[0])).toBe(true)
    store.actions.addProduct('serum')
    expect(snapshot.cart).toEqual([])
    fail = true
    await store.actions.loadCatalog()
    expect(store.getSnapshot().phase).toBe('error')
    expect(store.actions.addProduct('serum')).toBe(false)
    fail = false
    await store.actions.loadCatalog()
    expect(store.getSnapshot().phase).toBe('ready')
    off()
    const calls = listener.mock.calls.length
    store.actions.clearCart()
    expect(listener).toHaveBeenCalledTimes(calls)
  })
  it('treats independent subscriptions using the same callback independently', () => {
    const store = createStorefrontAdapter()
    const callback = vi.fn()
    const first = store.subscribe(callback)
    const second = store.subscribe(callback)
    first()
    first()
    store.actions.setPromoCode('GLOW20')
    expect(callback).toHaveBeenCalledTimes(1)
    second()
  })
  it('preserves saved IDs when the API is empty or unavailable', async () => {
    const storage = memory()
    storage.setItem(
      'roseveil-shopping-bag-v1',
      JSON.stringify({ items: [{ id: 'serum', quantity: 2 }] }),
    )
    const store = createStorefrontAdapter({
      storage,
      fetcher: async () => Response.json({ items: [] }),
    })
    await store.actions.loadCatalog()
    expect(store.getSnapshot().cart).toEqual([{ id: 'serum', quantity: 2 }])
  })
})
