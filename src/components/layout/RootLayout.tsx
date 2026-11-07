import { Suspense, useEffect, useEffectEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import SiteFooter from './SiteFooter.tsx'
import SiteLayout from './SiteLayout.tsx'
import AnnouncementBar from './AnnouncementBar.tsx'
import SiteHeader from './SiteHeader.tsx'
import Toast from '../../shared/ui/Toast.tsx'
import { useStorefront } from '../../features/storefront/useStorefront.ts'

import StorefrontDialog from '../../features/cart/StorefrontDialog.tsx'
import { useShoppingBag } from '../../features/cart/useShoppingBag.ts'
import { useCatalogNavigation } from '../../features/catalog/useCatalogNavigation.ts'
import { useNotification } from '../../shared/ui/useNotification.ts'
import {
  navigationItems,
  unavailableMessage,
} from '../../features/navigation/navigation.ts'

import { useHomeCatalog } from '../../features/catalog/homeCatalog.context.ts'
import { useTheme } from '../../features/theme/useTheme.ts'

export default function RootLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { snapshot, actions } = useStorefront()
  const { toggleTheme } = useTheme(snapshot.theme, actions.setTheme)
  const { notification, notify, copyCode, clearNotification } =
    useNotification()
  const catalog = useCatalogNavigation(false)
  const homeCatalog = useHomeCatalog()
  const { filters, headingRef, changeQuery, selectCategory } = catalog
  const bag = useShoppingBag(snapshot, actions, notify, headingRef)
  const { activeDialog, setActiveDialog, bagCount } = bag
  function goHome() {
    homeCatalog.home()
    if (pathname === '/')
      document.getElementById('main')?.scrollIntoView({ behavior: 'auto' })
  }
  const dismissRouteDialog = useEffectEvent(() => {
    if (activeDialog) {
      setActiveDialog(null)
      clearNotification()
    }
  })
  useEffect(() => {
    dismissRouteDialog()
    document.getElementById('main')?.focus({ preventScroll: true })
    document.getElementById('main')?.scrollIntoView({ behavior: 'auto' })
  }, [pathname])
  const activeId =
    pathname === '/'
      ? (homeCatalog.activeId ?? 'home')
      : pathname === '/about'
        ? 'about'
        : pathname === '/shop'
          ? catalog.activeId === 'home'
            ? 'shop'
            : catalog.activeId
          : undefined
  return (
    <>
      <SiteLayout
        footer={
          <SiteFooter
            onHome={goHome}
            onShop={catalog.reset}
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
              bagIsDialog={pathname !== '/bag' && pathname !== '/checkout'}
              onOpenBag={() => {
                if (pathname === '/bag')
                  document.getElementById('cart-content')?.focus()
                else if (pathname === '/checkout') navigate('/bag')
                else setActiveDialog({ kind: 'bag' })
              }}
              items={navigationItems}
              activeId={activeId}
              query={filters.query}
              onQueryChange={changeQuery}
              onSearchSubmit={() => {
                if (pathname === '/shop') catalog.searchSubmit()
                else navigate('/shop')
              }}
              onCategoryChange={(category) => {
                if (category === 'All') catalog.reset()
                else if (pathname === '/') {
                  homeCatalog.selectCategory(category)
                  homeCatalog.searchSubmit()
                } else selectCategory(category)
              }}
              onHome={goHome}
              unavailableMessage={unavailableMessage}
            />
          </>
        }
      >
        <Suspense
          fallback={
            <p className="route-loading container" role="status">
              Loading page...
            </p>
          }
        >
          <Outlet context={{ catalog, bag }} />
        </Suspense>
      </SiteLayout>
      <StorefrontDialog
        {...bag}
        snapshot={snapshot}
        actions={actions}
        notification={notification}
        clearNotification={clearNotification}
        continueShopping={() => {
          bag.continueShopping()
          navigate('/shop')
        }}
      />
      <Toast
        message={activeDialog ? '' : notification.message}
        announcementId={notification.revision}
      />
    </>
  )
}
