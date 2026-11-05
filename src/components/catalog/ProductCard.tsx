import type { Product } from '../../modules/products/products.types.ts'
import { formatMoney } from '../../logic.ts'
import ProductImage from './ProductImage.tsx'

interface ProductCardProps {
  product: Readonly<Product>
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}

export default function ProductCard({
  product,
  onAdd,
  onDetails,
}: ProductCardProps) {
  return (
    <article className="product-card" aria-label={product.name}>
      <button
        type="button"
        className="product-image-button"
        aria-label={`View ${product.name}`}
        onClick={() => onDetails(product.id)}
      >
        <ProductImage product={product} />
      </button>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>
          <button
            className="product-name"
            type="button"
            onClick={() => onDetails(product.id)}
          >
            {product.name}
          </button>
        </h3>
        <p className="product-price">{formatMoney(product.price)}</p>
      </div>
      <button
        className="add-button"
        type="button"
        onClick={() => onAdd(product.id)}
        aria-label={`Add ${product.name} to bag`}
      >
        <svg className="icon" aria-hidden="true">
          <use href="#i-bag" />
        </svg>{' '}
        ADD TO CART
      </button>
    </article>
  )
}
