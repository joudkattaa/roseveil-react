import { Link } from 'react-router'
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
    <article className="product-detail" aria-label={product.name}>
      <figure className="product-detail-media">
        <ProductImage product={product} variant="detail" />
        <figcaption>
          ROSEVEIL <span>COSMETICS</span>
        </figcaption>
      </figure>
      <div className="product-detail-copy">
        <p className="eyebrow">{product.category}</p>
        <div className="product-detail-price-row">
          {available ? (
            <p className="product-detail-price">
              {formatMoney(product.price)} <span>USD</span>
            </p>
          ) : (
            <p role="status">
              Current price unavailable. Reload the collection before adding.
            </p>
          )}
        </div>
        <p className="product-detail-description">{product.description}</p>
        <dl className="product-detail-specs">
          <div>
            <dt>Size</dt>
            <dd>{product.size}</dd>
          </div>
          <div>
            <dt>Collection</dt>
            <dd>{product.category}</dd>
          </div>
        </dl>
        <div className="product-detail-purchase">
          <button
            className="button"
            type="button"
            disabled={!available}
            onClick={() => onAdd(product.id)}
          >
            <svg className="icon" aria-hidden="true">
              <use href="#i-bag" />
            </svg>
            ADD TO BAG
          </button>
          <Link className="product-detail-bag-link" to="/bag">
            View shopping bag <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <p className="product-detail-promo">
          A little treat: use <strong>GLOW20</strong> in your bag for 20% off
          merchandise.
        </p>
        <details className="product-detail-disclosure">
          <summary>Delivery &amp; demo checkout</summary>
          <p>
            Demo shipping is $5.95. It is free when your merchandise total after
            discounts is over $50. Review your bag before continuing to demo
            checkout.
          </p>
        </details>
        <details className="product-detail-disclosure">
          <summary>About this concept</summary>
          <p>
            Illustrative product. Images and sizes are for this concept store.
            No real purchase or product claims. No payment, real order or
            shipping request occurs.
          </p>
        </details>
      </div>
    </article>
  )
}
