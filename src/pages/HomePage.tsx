import { useEffect } from 'react'
import { useHomeCatalog } from '../features/catalog/homeCatalog.context.ts'
import HeroSection from '../components/hero/HeroSection.tsx'
import CategorySection from '../components/editorial/CategorySection.tsx'
import AboutSection from '../components/editorial/AboutSection.tsx'
import BeautyPromise from '../components/editorial/BeautyPromise.tsx'
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
      <HeroSection onExplore={shopCatalog.reset} />
      <CategorySection
        category={catalog.filters.featured ? null : catalog.filters.category}
        onSelect={selectCategory}
      />
      <AboutSection storyId="about-story" />
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
      <BeautyPromise headingId="promise-title" />
    </>
  )
}
