import { useState } from 'react'
import type { Product } from '../../modules/products/products.types.ts'

interface ProductImageProps {
  secondaryImage?: string
  product: Readonly<Product>
  variant?: 'card' | 'detail' | 'cart'
}

export default function ProductImage({
  product,
  variant = 'card',
  secondaryImage,
}: ProductImageProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [loadedSecondary, setLoadedSecondary] = useState<string | null>(null)
  const [failedSecondary, setFailedSecondary] = useState<string | null>(null)
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
  const primary = (
    <img
      className="product-primary"
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
  if (
    variant !== 'card' ||
    !secondaryImage ||
    secondaryImage === base + '.webp'
  )
    return primary
  const ready =
    loadedSecondary === secondaryImage && failedSecondary !== secondaryImage
  return (
    <span className="product-image-stack" data-secondary-ready={ready}>
      {primary}
      <img
        className="product-secondary"
        src={secondaryImage}
        alt=""
        aria-hidden="true"
        width={600}
        height={600}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoadedSecondary(secondaryImage)}
        onError={() => setFailedSecondary(secondaryImage)}
      />
    </span>
  )
}
