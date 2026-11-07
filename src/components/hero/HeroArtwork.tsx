import { useHeroEntrance } from './useHeroEntrance.ts'

interface HeroArtworkProps {
  accessibleLabel: string
}

const products = [
  { id: 'tube', width: 265, height: 650 },
  { id: 'pump', width: 227, height: 650 },
  { id: 'serum', width: 248, height: 650 },
  { id: 'jar', width: 450, height: 362 },
]

export default function HeroArtwork({ accessibleLabel }: HeroArtworkProps) {
  const { artworkRef, active, entrance, imageLoaded, imageFailed } =
    useHeroEntrance()
  return (
    <div
      ref={artworkRef}
      className="hero-artwork"
      role="img"
      aria-label={accessibleLabel}
    >
      <picture className="hero-media" hidden={active}>
        <img
          className="hero-image"
          src="/roseveil/hero-ivory-classic.jpg"
          srcSet="/roseveil/hero-ivory-classic-640.jpg 640w, /roseveil/hero-ivory-classic.jpg 1254w"
          sizes="(min-width: 1313px) 840px, (min-width: 800px) 64vw, (min-width: 778px) 700px, 90vw"
          decoding="async"
          alt=""
          fetchPriority="high"
          width={1254}
          height={1254}
        />
      </picture>
      <div
        className="hero-layered-scene hero-media"
        hidden={!active}
        data-entrance={active ? entrance : undefined}
      >
        <img
          className="hero-scene-background"
          src="/roseveil/hero-stage-ivory.jpg"
          data-hero-asset="stage"
          alt=""
          width={1254}
          height={1254}
          loading="eager"
          decoding="async"
          onLoad={() => imageLoaded('stage')}
          onError={imageFailed}
        />
        {products.map((product) => (
          <span
            key={product.id}
            className={'hero-product-layer hero-layer-' + product.id}
          >
            <img
              src={'/roseveil/hero-layer-classic-' + product.id + '.webp'}
              data-hero-asset={product.id}
              alt=""
              width={product.width}
              height={product.height}
              loading="eager"
              decoding="async"
              onLoad={() => imageLoaded(product.id)}
              onError={imageFailed}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
