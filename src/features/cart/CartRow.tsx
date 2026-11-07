import { useRef } from 'react'
import type { Product } from '../../modules/products/products.types.ts'
import { formatMoney } from '../../logic.ts'
import ProductImage from '../catalog/ProductImage.tsx'

interface CartRowProps {
  id: string
  product: Readonly<Product> | undefined
  quantity: number
  pricesAvailable: boolean
  onQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onRowRemoved: () => void
}

export default function CartRow({
  id,
  product,
  quantity,
  pricesAvailable,
  onQuantity,
  onRemove,
  onRowRemoved,
}: CartRowProps) {
  const decrease = useRef<HTMLButtonElement>(null)
  const name = product?.name ?? id
  return (
    <li className="cart-line">
      {product ? (
        <ProductImage product={product} variant="cart" />
      ) : (
        <span>Image unavailable</span>
      )}
      <div>
        <h3>{name}</h3>
        <p>
          {pricesAvailable && product
            ? formatMoney(product.price)
            : 'Price unavailable'}
          {product ? ` · ${product.size}` : ''}
        </p>
        <div className="quantity">
          <button
            ref={decrease}
            type="button"
            aria-label={`Decrease quantity of ${name}`}
            onClick={() => {
              onQuantity(id, -1)
              if (quantity === 1) onRowRemoved()
            }}
          >
            −
          </button>
          <span aria-label={`Quantity of ${name}`}>{quantity}</span>
          <button
            type="button"
            disabled={quantity >= 99}
            aria-label={`Increase quantity of ${name}`}
            onClick={() => {
              onQuantity(id, 1)
              if (quantity === 98) decrease.current?.focus()
            }}
          >
            +
          </button>
        </div>
      </div>
      <div>
        {pricesAvailable && product ? (
          <p className="cart-line-total">
            {formatMoney(product.price * quantity)}
          </p>
        ) : null}
        <button
          className="remove-line"
          type="button"
          aria-label={`Remove ${name}`}
          onClick={() => {
            onRemove(id)
            onRowRemoved()
          }}
        >
          Remove
        </button>
      </div>
    </li>
  )
}
