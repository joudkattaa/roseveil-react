import { Link } from 'react-router'
import type { Product } from '../../modules/products/products.types.ts'
import { formatMoney } from '../../logic.ts'
import ProductImage from './ProductImage.tsx'

import { secondaryImages } from './secondaryImages.ts'

interface ProductCardProps {
  product: Readonly<Product>
  onAdd: (id: string) => void
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card" aria-label={product.name}>
      <Link
        to={'/products/' + product.id}
        className="product-image-button"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          product={product}
          secondaryImage={secondaryImages[product.id]}
        />
      </Link>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>
          <Link className="product-name" to={'/products/' + product.id}>
            {product.name}
          </Link>
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
