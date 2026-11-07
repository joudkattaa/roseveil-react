import PageFrame from '../shared/ui/PageFrame.tsx'
import ErrorBoundary from '../shared/ui/ErrorBoundary.tsx'
import CatalogSection from '../features/catalog/CatalogSection.tsx'
import { useStorefront } from '../features/storefront/useStorefront.ts'
import { useStorefrontUi } from '../features/storefront/useStorefrontUi.ts'
export default function ShopPage() {
  const { snapshot, actions } = useStorefront()
  const { catalog, bag } = useStorefrontUi()
  return (
    <PageFrame title="Shop ROSEVEIL" width="full">
      <ErrorBoundary label="The product collection">
        <CatalogSection
          onAdd={bag.addProduct}
          products={snapshot.catalog}
          filters={catalog.filters}
          onFiltersChange={catalog.setFilters}
          onCategoryChange={catalog.selectCategory}
          onShopAll={catalog.reset}
          onReset={catalog.reset}
          onToggleFeatured={catalog.toggleFeatured}
          headingRef={catalog.headingRef}
          phase={snapshot.phase}
          catalogEmpty={snapshot.catalog.length === 0}
          onRetry={actions.loadCatalog}
        />
      </ErrorBoundary>
    </PageFrame>
  )
}
