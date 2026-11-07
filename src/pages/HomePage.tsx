import { useEffect } from 'react'
import { useHomeCatalog } from '../features/catalog/homeCatalog.context.ts'
import HeroSection from '../components/hero/HeroSection.tsx'
import CategorySection from '../components/editorial/CategorySection.tsx'
import AboutSection from '../components/editorial/AboutSection.tsx'
import BeautyPromise from '../components/editorial/BeautyPromise.tsx'
import ErrorBoundary from '../shared/ui/ErrorBoundary.tsx'
import CatalogSection from '../features/catalog/CatalogSection.tsx'
import { useStorefront } from '../features/storefront/useStorefront.ts'
import { useStorefrontUi } from '../features/storefront/useStorefrontUi.ts'
export default function HomePage() {
  const { snapshot, actions } = useStorefront()
  const { catalog: shopCatalog, bag } = useStorefrontUi()
  const catalog = useHomeCatalog()
  function selectCategory(
    category: Parameters<typeof catalog.selectCategory>[0],
  ) {
    catalog.selectCategory(category)
    catalog.searchSubmit()
  }
  useEffect(() => {
    document.title = 'Home \u2014 ROSEVEIL Cosmetics'
  }, [])
  return (
    <>
      <link
        rel="preload"
        as="image"
        type="image/jpeg"
        href="/roseveil/hero-ivory-classic.jpg"
        imageSrcSet="/roseveil/hero-ivory-classic-640.jpg 640w, /roseveil/hero-ivory-classic.jpg 1254w"
        imageSizes="(min-width: 1313px) 840px, (min-width: 800px) 64vw, (min-width: 778px) 700px, 90vw"
        fetchPriority="high"
      />
      <HeroSection onExplore={shopCatalog.reset} />
      <CategorySection
        category={catalog.filters.featured ? null : catalog.filters.category}
        onSelect={selectCategory}
      />
      <AboutSection storyId="about-story" />
      <ErrorBoundary label="The product collection">
        <CatalogSection
          onAdd={bag.addProduct}
          products={snapshot.catalog}
          filters={catalog.filters}
          onFiltersChange={catalog.setFilters}
          onCategoryChange={selectCategory}
          onShopAll={shopCatalog.reset}
          onReset={catalog.reset}
          onToggleFeatured={catalog.toggleFeatured}
          headingRef={catalog.headingRef}
          phase={snapshot.phase}
          catalogEmpty={snapshot.catalog.length === 0}
          onRetry={actions.loadCatalog}
        />
      </ErrorBoundary>
      <BeautyPromise headingId="promise-title" />
    </>
  )
}
