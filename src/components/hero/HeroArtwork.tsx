interface HeroArtworkProps {
  accessibleLabel: string
}

export default function HeroArtwork({ accessibleLabel }: HeroArtworkProps) {
  return (
    <div className="hero-artwork">
      <picture className="hero-media">
        <img
          className="hero-image"
          src="/roseveil/hero-ivory-classic.jpg"
          srcSet="/roseveil/hero-ivory-classic-640.jpg 640w, /roseveil/hero-ivory-classic.jpg 1254w"
          sizes="(min-width: 1313px) 840px, (min-width: 800px) 64vw, (min-width: 778px) 700px, 90vw"
          decoding="async"
          alt={accessibleLabel}
          fetchPriority="high"
          width={1254}
          height={1254}
        />
      </picture>
    </div>
  )
}
