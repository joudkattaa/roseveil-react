import Dialog from './components/shared/Dialog.tsx'
import ShoppingBag from './components/cart/ShoppingBag.tsx'
import ProductDetails from './components/catalog/ProductDetails.tsx'
import { productById } from './logic.ts'
import type { Category } from './modules/products/products.types.ts'
import type { CatalogFilters } from './types/ui.types.ts'
import SiteFooter from './components/layout/SiteFooter.tsx'
import SiteLayout from './components/layout/SiteLayout.tsx'
import HeroSection from './components/hero/HeroSection.tsx'
import AnnouncementBar from './components/layout/AnnouncementBar.tsx'
import SiteHeader from './components/layout/SiteHeader.tsx'
import { useEffect, useRef, useState } from 'react'
import Toast from './components/shared/Toast.tsx'
import CategorySection from './components/editorial/CategorySection.tsx'
import AboutSection from './components/editorial/AboutSection.tsx'
import BeautyPromise from './components/editorial/BeautyPromise.tsx'
import type { NavigationItem } from './types/navigation.types.ts'
import CatalogSection from './components/catalog/CatalogSection.tsx'
import { useStorefront } from './hooks/useStorefront.ts'

const unavailableMessage =
  'Blog, Contact, theme switching and account will be available in later migration stages.'
const navigationItems: readonly NavigationItem[] = [
  { id: 'home', label: 'HOME', available: true, href: '#top' },
  {
    id: 'shop',
    label: 'SHOP',
    available: true,
    href: '#products',
    category: 'All',
  },
  {
    id: 'skin-care',
    label: 'SKIN CARE',
    available: true,
    href: '#products',
    category: 'Skin Care',
  },
  {
    id: 'makeup',
    label: 'MAKEUP',
    available: true,
    href: '#products',
    category: 'Makeup',
  },
  {
    id: 'hair-care',
    label: 'HAIR CARE',
    available: true,
    href: '#products',
    category: 'Hair Care',
  },
  {
    id: 'body-care',
    label: 'BODY CARE',
    available: true,
    href: '#products',
    category: 'Body Care',
  },
  {
    id: 'about',
    label: 'ABOUT US',
    available: true,
    href: '#about',
  },
  {
    id: 'journal',
    label: 'BLOG',
    available: false,
    reason: 'Journal not yet available.',
  },
  {
    id: 'contact',
    label: 'CONTACT US',
    available: false,
    reason: 'Contact form not yet available.',
  },
]

export default function App() {
  const { snapshot, actions } = useStorefront()
  const [activeDialog, setActiveDialog] = useState<
    null | { kind: 'bag' } | { kind: 'product'; id: string }
  >(null)
  const selectedProduct =
    activeDialog?.kind === 'product'
      ? productById(activeDialog.id, snapshot.catalog)
      : undefined
  const bagCount = snapshot.cart.reduce((sum, item) => sum + item.quantity, 0)
  function notify(message: string) {
    setNotification((current) => ({ message, revision: current.revision + 1 }))
  }
  function addProduct(id: string) {
    const product = productById(id, snapshot.catalog)
    if (!product || snapshot.phase !== 'ready') {
      notify('Products are unavailable. Please reload the collection.')
      return
    }
    notify(
      actions.addProduct(id)
        ? product.name + ' added to your bag.'
        : 'You have reached the limit of 99 for this item.',
    )
  }
  function continueShopping() {
    setActiveDialog(null)
    headingRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const [filters, setFilters] = useState<CatalogFilters>({
    category: 'All',
    query: '',
    sort: 'default',
    featured: true,
  })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const filtered =
    filters.category !== 'All' ||
    Boolean(filters.query) ||
    filters.sort !== 'default'
  const activeId =
    filters.featured && !filtered
      ? 'home'
      : !filters.featured
        ? navigationItems.find(
            (item) => item.available && item.category === filters.category,
          )?.id
        : undefined
  function selectCategory(category: Category | 'All') {
    setFilters((current) => ({ ...current, category, featured: false }))
  }
  function changeQuery(query: string) {
    setFilters((current) => ({ ...current, query, featured: false }))
  }
  function home() {
    setFilters({ category: 'All', query: '', sort: 'default', featured: true })
  }
  function reset() {
    setFilters({ category: 'All', query: '', sort: 'default', featured: false })
    headingRef.current?.focus({ preventScroll: true })
  }
  function toggleFeatured() {
    setFilters({
      category: 'All',
      query: '',
      sort: 'default',
      featured: !filters.featured && !filtered,
    })
  }
  function searchSubmit() {
    headingRef.current?.scrollIntoView({ behavior: 'auto' })
    headingRef.current?.focus({ preventScroll: true })
  }
  const [notification, setNotification] = useState({ message: '', revision: 0 })

  useEffect(() => {
    if (!notification.message) return
    const timer = window.setTimeout(() => {
      setNotification((current) => ({ ...current, message: '' }))
    }, 3800)
    return () => window.clearTimeout(timer)
  }, [notification])

  async function copyCode() {
    let message: string
    try {
      await navigator.clipboard.writeText('GLOW20')
      message = 'GLOW20 copied! Apply it in your bag for 20% off.'
    } catch {
      message =
        'Could not copy GLOW20. Enter it manually in your bag for 20% off.'
    }
    setNotification((current) => ({ message, revision: current.revision + 1 }))
  }
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
              bagCount={bagCount}
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
      {activeDialog ? (
        <Dialog
          title={
            activeDialog.kind === 'bag'
              ? 'Your Shopping Bag'
              : (selectedProduct?.name ?? 'Product unavailable')
          }
          onClose={() => {
            setActiveDialog(null)
            setNotification((current) => ({ ...current, message: '' }))
          }}
        >
          {activeDialog.kind === 'bag' ? (
            <ShoppingBag
              snapshot={snapshot}
              onQuantity={(id, delta) => {
                actions.changeQuantity(id, delta)
                notify('Shopping bag quantity updated.')
              }}
              onRemove={(id) => {
                actions.removeProduct(id)
                notify('Product removed from your bag.')
              }}
              onClear={() => {
                actions.clearCart()
                notify('Shopping bag cleared.')
              }}
              onPromo={(code) => {
                actions.setPromoCode(code)
              }}
              onContinue={continueShopping}
              onRetry={actions.loadCatalog}
            />
          ) : selectedProduct ? (
            <ProductDetails
              product={selectedProduct}
              available={snapshot.phase === 'ready'}
              onAdd={addProduct}
            />
          ) : (
            <p>Product unavailable. Please close and reload the collection.</p>
          )}
          <p role="status" aria-atomic="true">
            {notification.message ? (
              <span key={notification.revision}>{notification.message}</span>
            ) : null}
          </p>
        </Dialog>
      ) : null}
      <Toast
        message={activeDialog ? '' : notification.message}
        announcementId={notification.revision}
      />
    </>
  )
}
