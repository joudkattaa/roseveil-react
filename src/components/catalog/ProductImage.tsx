import { useState } from 'react'
import type { Product } from '../../modules/products/products.types.ts'

interface ProductImageProps {
  product: Readonly<Product>
  variant?: 'card' | 'detail' | 'cart'
}

export default function ProductImage({
  product,
  variant = 'card',
}: ProductImageProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  if (failedImage === product.image) {
    return (
      <span
        className="product-image-fallback"
        role="img"
        aria-label={`${product.name}: image unavailable`}
      >
        Image unavailable
      </span>
    )
  }
  const base = `/roseveil/${product.image}`
  return (
    <img
      src={`${base}.webp`}
      srcSet={`${base}-240.webp 240w, ${base}-480.webp 480w, ${base}-800.webp 800w, ${base}.webp 1254w`}
      sizes={
        variant === 'cart'
          ? '70px'
          : variant === 'detail'
            ? '280px'
            : '(min-width: 1200px) 250px, (min-width: 900px) 25vw, (min-width: 600px) 34vw, 50vw'
      }
      alt={product.name}
      width={variant === 'cart' ? 70 : 600}
      height={variant === 'cart' ? 70 : 600}
      loading={variant === 'card' ? 'lazy' : 'eager'}
      decoding="async"
      onError={() => setFailedImage(product.image)}
    />
  )
}
