import SiteFooter from './components/layout/SiteFooter.tsx'
import SiteLayout from './components/layout/SiteLayout.tsx'
import HeroSection from './components/hero/HeroSection.tsx'
import AnnouncementBar from './components/layout/AnnouncementBar.tsx'
import SiteHeader from './components/layout/SiteHeader.tsx'
import Toast from './shared/ui/Toast.tsx'
import CategorySection from './components/editorial/CategorySection.tsx'
import AboutSection from './components/editorial/AboutSection.tsx'
import BeautyPromise from './components/editorial/BeautyPromise.tsx'
import CatalogSection from './features/catalog/CatalogSection.tsx'
import { useStorefront } from './features/storefront/useStorefront.ts'

import StorefrontDialog from './features/cart/StorefrontDialog.tsx'
import { useShoppingBag } from './features/cart/useShoppingBag.ts'
import { useCatalogNavigation } from './features/catalog/useCatalogNavigation.ts'
import { useNotification } from './shared/ui/useNotification.ts'
import {
  navigationItems,
  unavailableMessage,
} from './features/navigation/navigation.ts'

import { useTheme } from './features/theme/useTheme.ts'

export default function App() {
  const { snapshot, actions } = useStorefront()
  const { toggleTheme } = useTheme(snapshot.theme, actions.setTheme)
  const { notification, notify, copyCode, clearNotification } =
    useNotification()
  const {
    filters,
    setFilters,
    headingRef,
    activeId,
    selectCategory,
    changeQuery,
    home,
    reset,
    toggleFeatured,
    searchSubmit,
  } = useCatalogNavigation()
  const bag = useShoppingBag(snapshot, actions, notify, headingRef)
  const { activeDialog, setActiveDialog, bagCount, addProduct } = bag
  return (
    <>
      <SiteLayout
        footer={
          <SiteFooter
            onHome={home}
            onShop={() => selectCategory('All')}
            unavailableMessage="Information, policies and contact demos will be available in later migration stages."
          />
        }
        header={
          <>
            <AnnouncementBar onCopyCode={copyCode} />
            <SiteHeader
              theme={snapshot.theme}
              onToggleTheme={toggleTheme}
              bagCount={bagCount}
              bagFeedback={bag.bagFeedback}
              onOpenBag={() => setActiveDialog({ kind: 'bag' })}
              items={navigationItems}
              activeId={activeId}
              query={filters.query}
              onQueryChange={changeQuery}
              onSearchSubmit={searchSubmit}
              onCategoryChange={selectCategory}
              onHome={home}
              unavailableMessage={unavailableMessage}
            />
          </>
        }
      >
        <HeroSection onExplore={() => selectCategory('All')} />
        <CategorySection
          category={filters.featured ? null : filters.category}
          onSelect={selectCategory}
        />
        <AboutSection storyId="about-story" />
        <CatalogSection
          onAdd={addProduct}
          onDetails={(id) => setActiveDialog({ kind: 'product', id })}
          products={snapshot.catalog}
          filters={filters}
          onFiltersChange={setFilters}
          onCategoryChange={selectCategory}
          onReset={reset}
          onToggleFeatured={toggleFeatured}
          headingRef={headingRef}
          phase={snapshot.phase}
          catalogEmpty={snapshot.catalog.length === 0}
          onRetry={actions.loadCatalog}
        />
        <BeautyPromise headingId="promise-title" />
      </SiteLayout>
      <StorefrontDialog
        {...bag}
        snapshot={snapshot}
        actions={actions}
        notification={notification}
        clearNotification={clearNotification}
      />
      <Toast
        message={activeDialog ? '' : notification.message}
        announcementId={notification.revision}
      />
    </>
  )
}
