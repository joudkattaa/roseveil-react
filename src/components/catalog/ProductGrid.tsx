import type { Product } from '../../modules/products/products.types.ts'
import ProductCard from './ProductCard.tsx'

interface ProductGridProps {
  products: readonly Readonly<Product>[]
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}

export default function ProductGrid({
  products,
  onAdd,
  onDetails,
}: ProductGridProps) {
  return (
    <div id="product-grid" className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
          onDetails={onDetails}
        />
      ))}
    </div>
  )
}
