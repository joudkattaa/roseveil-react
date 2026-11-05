import type { Product } from '../../modules/products/products.types.ts'
import { formatMoney } from '../../logic.ts'
import ProductImage from './ProductImage.tsx'

interface ProductDetailsProps {
  product: Readonly<Product>
  available: boolean
  onAdd: (id: string) => void
}

export default function ProductDetails({
  product,
  available,
  onAdd,
}: ProductDetailsProps) {
  return (
    <div className="modal-product">
      <ProductImage product={product} variant="detail" />
      <div>
        <p className="eyebrow">{product.category}</p>
        <p>{product.description}</p>
        {available ? (
          <p className="modal-price">{formatMoney(product.price)}</p>
        ) : (
          <p role="status">
            Current price unavailable. Reload the collection before adding.
          </p>
        )}
        <p>{product.size}</p>
        <button
          className="button"
          type="button"
          disabled={!available}
          onClick={() => onAdd(product.id)}
        >
          ADD TO BAG
        </button>
        <small>
          Illustrative product. Images and sizes are for this concept store. No
          real purchase or product claims.
        </small>
      </div>
    </div>
  )
}
