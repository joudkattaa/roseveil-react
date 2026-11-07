import { Link, useParams } from 'react-router'
import PageFrame from '../shared/ui/PageFrame.tsx'
import ProductDetails from '../features/catalog/ProductDetails.tsx'
import { useProductDetails } from '../features/catalog/useProductDetails.ts'
import { useStorefront } from '../features/storefront/useStorefront.ts'
import { useStorefrontUi } from '../features/storefront/useStorefrontUi.ts'
export default function ProductDetailsPage() {
  const { id } = useParams()
  const { state, retry } = useProductDetails(id)
  const { snapshot, actions } = useStorefront()
  const { bag } = useStorefrontUi()
  const product = 'product' in state ? state.product : undefined
  const available =
    snapshot.phase === 'ready' &&
    Boolean(
      product &&
      snapshot.catalog.some(
        (item) => item.id === product.id && item.price === product.price,
      ),
    )
  return (
    <div className="product-page">
      <PageFrame title={product?.name ?? 'Product Details'}>
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product?.name ?? 'Product Details'}</span>
        </nav>
        {product ? (
          <>
            <ProductDetails
              product={product}
              available={available}
              onAdd={bag.addProduct}
            />
            {!available ? (
              <button
                className="button"
                type="button"
                disabled={snapshot.phase === 'loading'}
                onClick={() => {
                  void actions.loadCatalog()
                }}
              >
                Reload collection
              </button>
            ) : null}
          </>
        ) : state.phase === 'loading' ? (
          <p role="status">Loading product...</p>
        ) : state.phase === 'error' ? (
          <>
            <p role="alert">Unable to load this product.</p>
            <button className="button" type="button" onClick={retry}>
              Try Again
            </button>
          </>
        ) : (
          <p role="alert">
            {state.phase === 'invalid'
              ? 'Invalid product ID.'
              : 'Product not found.'}
          </p>
        )}
        <Link className="text-button product-back-link" to="/shop">
          Back to Shop
        </Link>
      </PageFrame>
    </div>
  )
}
