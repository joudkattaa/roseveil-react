# ROSEVEIL Cosmetics — React Day 4

A Vite + React + TypeScript migration of the original ROSEVEIL concept storefront. The original ShopBoard project is read-only. This repository preserves all nine Day 3 modules from commit 731aaf7 without modification.

## Run locally

Use Node.js 24 (the development environment), then run:

```text
npm ci
npm run dev
```

The same-origin GET /api/products endpoint serves 30 original products. Vite development and preview include API middleware; api/products.ts provides the original serverless handler. Static dist files alone do not provide an API server. No deployment has been performed.

## Implemented experience

Original header, hero, benefits/ribbon, categories, About expansion, Beauty Philosophy and premium footer; local demo newsletter; GLOW20 clipboard feedback; API-powered catalog; featured/all products, synchronized header/catalog search, seven categories and price sorting; loading/error/retry/API-empty/no-match states; single-image cards with reduced-motion-aware hover/focus effects; shopping bag with quantity, remove/clear, promo code, totals and persistence; product details sharing the same bag; customer information, order summary and confirmation in a local-only demo checkout.

Account/contact/policy dialogs and parallax remain unavailable. Sequential original Hero layers, subtle card hover/focus feedback, one-time section reveal and bag feedback are implemented. The header has a keyboard-accessible Light/Dark toggle using the original soft pink/beige and burgundy/rose-gold styles. No payment, real order, personal-data storage or email delivery occurs.

## Components and ownership

### Actual React component tree

Mounted by src/main.tsx inside StrictMode. The tree below includes all 29 reusable component files; repeated appearances are instances of the same component. DOM-only markup is labelled explicitly.

```text
App (src/App.tsx; root, no incoming props)
|-- SiteLayout
|   |-- header slot (created by App)
|   |   |-- AnnouncementBar
|   |   `-- SiteHeader
|   |       |-- MainNavigation
|   |       |-- SearchField (header search)
|   |       `-- ThemeToggle (src/features/theme/ThemeToggle.tsx)
|   |-- main / children slot
|   |   |-- HeroSection (includes Benefits and Signature Ribbon markup)
|   |   |   `-- HeroArtwork
|   |   |-- CategorySection
|   |   |-- AboutSection
|   |   |-- CatalogSection
|   |   |   |-- CatalogControls
|   |   |   |   `-- SearchField (catalog search)
|   |   |   |-- CatalogStatus
|   |   |   `-- ProductGrid
|   |   |       `-- ProductCard (one per visible product)
|   |   |           `-- ProductImage (card variant)
|   |   `-- BeautyPromise
|   `-- footer slot (created by App)
|       `-- SiteFooter
|           `-- NewsletterForm
|-- StorefrontDialog (src/features/cart/StorefrontDialog.tsx)
|   `-- Dialog (conditional; one native modal)
|       |-- ShoppingBag (bag branch)
|       |   |-- CartRow (one per saved line)
|       |   |   `-- ProductImage (cart variant, if product resolves)
|       |   `-- PromoForm (nonempty bag)
|       |-- ProductDetails (alternative product branch, if product resolves)
|       |   `-- ProductImage (detail variant)
|       |-- CheckoutForm (checkout step)
|       |   `-- OrderSummary
|       |-- DemoOrderConfirmation (confirmation step)
|       |   `-- OrderSummary
|       `-- modal status markup (rendered by StorefrontDialog)
`-- Toast (empty while the modal owns feedback)
```

### Feature organization

- src/features/catalog contains catalog components and the shared catalog navigation hook.
- src/features/cart contains bag components, dialog composition and shopping-bag UI state.
- src/features/checkout contains CheckoutForm, OrderSummary, DemoOrderConfirmation and a current-price eligibility helper that reuses protected cartTotals.
- src/features/storefront contains the React subscription hook and immutable adapter around the unchanged Day 3 store.
- src/features/navigation contains the existing navigation data.
- src/features/theme contains ThemeToggle, the DOM theme hook and the initial system-preference storage fallback.
- src/shared/motion contains the progressive section reveal hook.
- src/shared/ui contains Dialog, Toast and notification state shared across features. ProductImage remains in catalog and is reused by cart.
- src/components retains the existing layout, hero, editorial and newsletter components. Protected Day 3 modules retain their original paths.

This refactor changes organization only. The original migration commit is retained; Git history has not been rewritten.

### State ownership and responsibilities

| Owner / exact file                                                      | Responsibility                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App / src/App.tsx                                                       | Assembles the page, shared hooks and dialog. Hook state belongs to this mounted App; components receive typed props and callbacks.                                                                                                                                                                                                                                                                                               |
| useCatalogNavigation / src/features/catalog/useCatalogNavigation.ts     | Owns CatalogFilters and the catalog heading ref; derives active navigation and handles category/query, Home, reset, featured switching and search focus.                                                                                                                                                                                                                                                                         |
| useShoppingBag / src/features/cart/useShoppingBag.ts                    | Owns bagFeedback revision (successful adds only) and activeDialog (bag, product, checkout or confirmation); derives selected product and bag count. Validates Add to Bag, handles quantity/removal/clear feedback and Continue Shopping. On valid demo submission it captures only the item/totals summary and clears the bag. Customer fields are never read into persistent state. Persistent bag data remains in the adapter. |
| useNotification / src/shared/ui/useNotification.ts                      | Owns notification message/revision, clipboard success/failure and the 3800ms timer with replacement/unmount cleanup.                                                                                                                                                                                                                                                                                                             |
| StorefrontDialog / src/features/cart/StorefrontDialog.tsx               | Renders the existing bag/product branches and one modal status target; forwards store actions and feedback without owning state.                                                                                                                                                                                                                                                                                                 |
| useStorefront / src/features/storefront/useStorefront.ts                | Lazily owns one adapter per mounted App. useSyncExternalStore reads its stable cached snapshots and cleans subscriptions; an effect starts catalog loading. StrictMode may invoke the discarded initializer, but no request/subscription is started during render.                                                                                                                                                               |
| Adapter / src/features/storefront/storefrontAdapter.ts                  | Exclusively wraps protected createState. Copies/freezes catalog records, cart lines, profile/error and snapshot containers. Bridges catalog notifications and publishes effective cart actions. Each subscription owns independent idempotent cleanup.                                                                                                                                                                           |
| Protected store / src/state.ts                                          | Owns catalog phase/data/error, cart, promo, theme and profile; preserves original localStorage behavior and internally mutable legacy implementation. React never receives the raw store.                                                                                                                                                                                                                                        |
| SiteHeader / src/components/layout/SiteHeader.tsx                       | Local menuOpen and searchOpen; effects manage focus, breakpoint changes and Escape/outside dismissal with cleanup. Query/category come from useCatalogNavigation through App.                                                                                                                                                                                                                                                    |
| CatalogControls / src/features/catalog/CatalogControls.tsx              | Local open-tool ID; scoped focus and outside-pointer effect with cleanup. Filter values come from App.                                                                                                                                                                                                                                                                                                                           |
| ProductImage / src/features/catalog/ProductImage.tsx                    | Tracks primary failure and optional secondary load/failure identities. Crossfade is enabled only after a supplied second view loads; current live mappings are empty.                                                                                                                                                                                                                                                            |
| AboutSection / src/components/editorial/AboutSection.tsx                | Local expanded story state.                                                                                                                                                                                                                                                                                                                                                                                                      |
| NewsletterForm / src/components/forms/NewsletterForm.tsx                | Local email/submitted state only; no personal-data persistence or requests.                                                                                                                                                                                                                                                                                                                                                      |
| PromoForm / src/features/cart/PromoForm.tsx                             | Local entered code and feedback string (named error in source); appliedCode comes from the store through App.                                                                                                                                                                                                                                                                                                                    |
| Dialog / src/shared/ui/Dialog.tsx                                       | No React state; refs/effect manage the native dialog and restore opener focus. Close/Escape waits for a cancellable 140ms native animation, with immediate reduced-motion/unsupported fallback. useShoppingBag owns whether it exists.                                                                                                                                                                                           |
| CatalogSection, ShoppingBag, CartRow                                    | Refs support focus management. Results and totals are derived from props with protected logic; no duplicate catalog/cart state.                                                                                                                                                                                                                                                                                                  |
| useTheme / src/features/theme/useTheme.ts                               | Applies snapshot.theme to the root data-theme attribute and toggles it through the protected store action. ThemeToggle only renders props; it has no local state.                                                                                                                                                                                                                                                                |
| CheckoutForm / src/features/checkout/CheckoutForm.tsx                   | Uses native uncontrolled fields and validation; customer details exist only in the mounted form, not in the store. Focuses its heading on entry.                                                                                                                                                                                                                                                                                 |
| DemoOrderConfirmation / src/features/checkout/DemoOrderConfirmation.tsx | Renders only the confirmed item/totals snapshot and focuses its heading. No customer details are retained.                                                                                                                                                                                                                                                                                                                       |
| useScrollReveal / src/shared/motion/useScrollReveal.ts                  | SiteLayout supplies its main ref. One IntersectionObserver reveals sections once using native animations, skips focused content and reduced motion, and cleans observers/listeners/animations. No section React state or scroll listeners.                                                                                                                                                                                       |
| useHeroEntrance / src/components/hero/useHeroEntrance.ts                | HeroArtwork owns loaded asset IDs, failure, viewport entrance and reduced-motion state through this hook. It checks cached images and cleans its preference listener. Only complete scenes animate; original fallback stays visible otherwise.                                                                                                                                                                                   |
| All other components                                                    | Render props/static content and forward events; no local useState.                                                                                                                                                                                                                                                                                                                                                               |

CatalogSection derives visible results with findProducts(category, query, featured, sort, products). Shared header/catalog searches and all category navigation update useCatalogNavigation's filters. ProductGrid uses product.id keys; CartRow uses saved item.id. ShoppingBag derives current totals only when the full catalog is ready and all saved lines resolve. StorefrontDialog renders one notification target for modal feedback; App keeps the page Toast empty during that modal. Benefits and Signature Ribbon are markup inside HeroSection, not separate components. SiteLayout receives composed ReactNode slots; it does not own App state.

### Exact component prop contracts

The declarations below are copied verbatim from the named source files. App has no incoming props. ReactNode, Ref and RefObject come from React. Product and Category come from src/modules/products/products.types.ts; CatalogFilters and CatalogPhase come from src/types/ui.types.ts; NavigationItem and NavigationId come from src/types/navigation.types.ts; StorefrontSnapshot comes from src/features/storefront/storefrontAdapter.ts. StorefrontAdapter comes from src/features/storefront/storefrontAdapter.ts; ActiveDialog comes from src/features/cart/useShoppingBag.ts. Theme comes from src/modules/state/state.types.ts. DemoOrder comes from src/features/checkout/checkout.logic.ts. These are documentation copies, not new declarations.

#### src/features/cart/CartRow.tsx

```ts
interface CartRowProps {
  id: string
  product: Readonly<Product> | undefined
  quantity: number
  pricesAvailable: boolean
  onQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onRowRemoved: () => void
}
```

#### src/features/cart/PromoForm.tsx

```ts
interface PromoFormProps {
  appliedCode: string
  onApply: (value: string) => void
}
```

#### src/features/cart/ShoppingBag.tsx

```ts
interface ShoppingBagProps {
  onCheckout: () => void
  focusOnMount?: boolean
  snapshot: StorefrontSnapshot
  onQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onPromo: (code: string) => void
  onContinue: () => void
  onRetry: () => Promise<void>
}
```

#### src/features/catalog/CatalogControls.tsx

```ts
interface CatalogControlsProps {
  filters: CatalogFilters
  onChange: (filters: CatalogFilters) => void
}
```

#### src/features/catalog/CatalogSection.tsx

```ts
interface CatalogSectionProps {
  onAdd: (id: string) => void
  onDetails: (id: string) => void
  products: readonly Readonly<Product>[]
  phase: CatalogPhase
  catalogEmpty: boolean
  filters: CatalogFilters
  onFiltersChange: (value: CatalogFilters) => void
  onCategoryChange: (value: Category | 'All') => void
  onRetry: () => Promise<void>
  onReset: () => void
  onToggleFeatured: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}
```

#### src/features/catalog/CatalogStatus.tsx

```ts
interface CatalogStatusProps {
  resultCount: number
  category: Category | 'All'
  onReset: () => void
  retryRef: Ref<HTMLButtonElement>
  phase: CatalogPhase
  catalogEmpty: boolean
  onRetry: () => Promise<void>
}
```

#### src/features/catalog/ProductCard.tsx

```ts
interface ProductCardProps {
  product: Readonly<Product>
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}
```

#### src/features/catalog/ProductDetails.tsx

```ts
interface ProductDetailsProps {
  product: Readonly<Product>
  available: boolean
  onAdd: (id: string) => void
}
```

#### src/features/catalog/ProductGrid.tsx

```ts
interface ProductGridProps {
  products: readonly Readonly<Product>[]
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}
```

#### src/features/catalog/ProductImage.tsx

```ts
interface ProductImageProps {
  secondaryImage?: string
  product: Readonly<Product>
  variant?: 'card' | 'detail' | 'cart'
}
```

#### src/features/catalog/SearchField.tsx

```ts
interface SearchFieldProps {
  children?: ReactNode
  id: string
  label: string
  value: string
  placeholder: string
  inputRef?: Ref<HTMLInputElement>
  onChange: (value: string) => void
}
```

#### src/components/editorial/AboutSection.tsx

```ts
interface AboutSectionProps {
  storyId: string
}
```

#### src/components/editorial/BeautyPromise.tsx

```ts
interface BeautyPromiseProps {
  headingId: string
}
```

#### src/components/editorial/CategorySection.tsx

```ts
interface CategorySectionProps {
  category: Category | 'All' | null
  onSelect: (category: Category) => void
}
```

#### src/components/forms/NewsletterForm.tsx

```ts
interface NewsletterFormProps {
  confirmationMessage: string
}
```

#### src/components/hero/HeroArtwork.tsx

```ts
interface HeroArtworkProps {
  accessibleLabel: string
}
```

#### src/components/hero/HeroSection.tsx

```ts
interface HeroSectionProps {
  onExplore: () => void
}
```

#### src/components/layout/AnnouncementBar.tsx

```ts
interface AnnouncementBarProps {
  onCopyCode: () => Promise<void>
}
```

#### src/components/layout/MainNavigation.tsx

```ts
interface MainNavigationProps {
  open: boolean
  items: readonly NavigationItem[]
  activeId: NavigationId | undefined
  onNavigate: () => void
  onCategoryChange: (value: Category | 'All') => void
  onHome: () => void
  navigationRef: Ref<HTMLElement>
}
```

#### src/components/layout/SiteFooter.tsx

```ts
interface SiteFooterProps {
  unavailableMessage: string
  onHome: () => void
  onShop: () => void
}
```

#### src/components/layout/SiteHeader.tsx

```ts
interface SiteHeaderProps {
  bagFeedback: number
  theme: Theme
  onToggleTheme: () => void
  bagCount: number
  onOpenBag: () => void
  items: readonly NavigationItem[]
  activeId: NavigationId | undefined
  unavailableMessage: string
  query: string
  onQueryChange: (value: string) => void
  onSearchSubmit: () => void
  onCategoryChange: (value: Category | 'All') => void
  onHome: () => void
}
```

#### src/components/layout/SiteLayout.tsx

```ts
interface SiteLayoutProps {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}
```

#### src/shared/ui/Dialog.tsx

```ts
interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
}
```

#### src/shared/ui/Toast.tsx

```ts
interface ToastProps {
  message: string
  announcementId: number
}
```

#### src/features/cart/StorefrontDialog.tsx

```ts
interface StorefrontDialogProps {
  beginCheckout: () => void
  backToBag: () => void
  confirmCheckout: () => void
  activeDialog: ActiveDialog
  setActiveDialog: (value: ActiveDialog) => void
  selectedProduct: Readonly<Product> | undefined
  snapshot: StorefrontSnapshot
  actions: StorefrontAdapter['actions']
  notification: { message: string; revision: number }
  changeQuantity: (id: string, delta: number) => void
  removeProduct: (id: string) => void
  clearBag: () => void
  clearNotification: () => void
  addProduct: (id: string) => void
  continueShopping: () => void
}
```

#### src/features/theme/ThemeToggle.tsx

```ts
interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}
```

#### src/features/checkout/CheckoutForm.tsx

```ts
interface CheckoutFormProps {
  order: DemoOrder | null
  onBack: () => void
  onConfirm: () => void
}
```

#### src/features/checkout/OrderSummary.tsx

```ts
interface OrderSummaryProps {
  order: DemoOrder
}
```

#### src/features/checkout/DemoOrderConfirmation.tsx

```ts
interface DemoOrderConfirmationProps {
  order: DemoOrder
  onContinue: () => void
}
```

## Business rules and persistence

Prices are integer USD cents from the validated full catalog. GLOW20 discounts merchandise by 20%, rounded to cents. Nonempty bags pay $5.95 shipping unless discounted merchandise is strictly above $50; exactly $50 still pays shipping. Quantity is limited to 99; decrement to zero removes a row. Clear Bag clears its promo.

The protected store uses roseveil-shopping-bag-v1 with items/promoCode and supports the legacy lumiere-shopping-bag-v1 fallback. Saved prices are never trusted. Storage failure falls back to memory. Loading/error/empty catalog responses preserve saved IDs; current prices and add actions require ready product data. No payable totals are shown when prices are unavailable.

Theme choice uses the existing roseveil-theme storage key. A valid saved light/dark choice wins. With no valid saved choice, the system preference is used once at startup without saving it as a user choice. The toggle saves an explicit choice; system changes do not override the active theme. Blocked storage falls back to memory. The protected store remains the single theme owner; useTheme applies its snapshot to the HTML root. Existing reduced-motion rules remain in place, and theme switching adds no animation.

The bag keeps existing pricing and persistence rules. Quantity/removal feedback names the product, no-op changes do not claim success, and removal/clear returns focus to the bag contents. Applied promo text is read-only until REMOVE is used; invalid codes never replace a valid discount. Mobile bag controls retain 44px quantity targets, narrow layouts and scrolling dialogs. Feedback space is reserved to reduce shifts. Checkout is an enabled local demo only when the bag is nonempty and every item has current validated catalog data.

## Demo checkout

The bag, checkout form and confirmation are steps inside the same native modal. Checkout requires a nonempty bag, ready catalog and resolvable items. The customer form has required full name, email, phone and address fields with native validation and length limits. Use sample details. Back to shopping bag preserves the bag and discards the entered fields. Closing checkout also preserves the bag.

A valid submission rechecks current catalog readiness, captures the item summary using the existing cartTotals function, shows a clearly labelled demo confirmation and clears the saved bag and promo. No payment, real order, email or shipping request occurs. Customer values are never copied into application state, localStorage, logs or network requests, and disappear when the form unmounts. The nonpersonal confirmation summary stays in memory until the dialog closes. Refresh does not retain the confirmation.

Checkout reuses the existing responsive dialog, labels, keyboard handling and light/burgundy palette. No new motion was added. Native browser validation bubbles, focus trapping, mobile appearance and screen-reader announcements still need real-browser acceptance.

## Subtle motion and optional second photos

HeroArtwork now reuses the original stage photo and four transparent tube/pump/serum/jar assets from the original project, copied byte-for-byte. Original responsive artwork sizing, desktop centering and layer percentage positions are preserved. The tube, serum, jar and pump enter at 0/180/360/540ms with 1100ms easing after every scene image loads. Cached images are checked on mount. IntersectionObserver watches the Hero section using the original 12% entry threshold. A full viewport exit resets the layers to ready; each return plays the original sequence again. Partial visibility changes never restart it while visible. Ordinary React updates and duplicate image loads do not replay it. The observer disconnects on unmount, image failure or reduced motion. Without IntersectionObserver, the loaded entrance runs once instead. The existing flattened photo stays visible while loading, on image failure and for reduced motion. No artwork was cropped, generated or replaced. The former whole-artwork animation was removed; copy still has its gentle entrance.

Product cards have no continuous movement or staggered delays. The original 3px hover/focus lift, gentle image zoom and shadow remain, with smooth transitions only when reduced motion is not requested. Mouse leave or focus leaving the card restores its resting position.

Section reveals use one IntersectionObserver and native element.animate, once per section per mounted page. Baseline content is always visible; unsupported APIs leave it static. Focused sections skip the animation. Reduced-motion changes cancel active reveals, and unmount cleans observers and animations. There are no scroll listeners. The bag icon and count pulse only after successful Add to Bag, not on quantity changes, refresh or rejected additions. Close/Escape keeps the native modal open during its short close animation and restores focus after it finishes; navigation out of the modal can close immediately. CSS motion is restricted to no-preference, and secondary swapping remains static on reduced motion.

ProductImage accepts an optional secondaryImage URL. It lazily loads the second view in the same reserved image box, enables a 350ms hover/focus crossfade only after load, and retains the primary after a loading failure. Touch controls remain usable. src/features/catalog/secondaryImages.ts intentionally has no live mappings: all inspected product assets are primary photos or responsive sizes, with no verified alternate views. No product-card photos were created, replaced or duplicated; five original Hero stage/layer assets were copied separately. Tests simulate a future secondary URL; they do not claim a new real photograph exists.

## Verification

```text
npm run typecheck
npm run lint
npm run build
npm run format:check
npm test
```

Tests cover API validation/methods, catalog selection, snapshot/subscription behavior, cart persistence/limits/discounts, real React StrictMode loading, modal interactions and synchronized search, theme defaults/persistence/keyboard switching/storage failures, bag remount/clear/quantity limits and focus after removal, and demo checkout validation/confirmation/back/empty/error/cart clearing, image swap load/failure fallback, product grid actions without floating metadata, reveal cleanup/reduced motion and animated dialog focus restoration. The suite limits concurrent jsdom workers to two and allows 15 seconds per test for full storefront interaction workflows. jsdom modal methods are simulated: native focus trapping, real keyboard/browser behavior, clipboard permissions, mobile visual parity, reduced motion and console/asset checks still require browser acceptance.

Development-only URLs: ?api-delay=1000, ?api-error=500, ?api-empty=1. Forced failures remain forced during Retry; automated recovery tests replace a failing response with success in the same mounted app. Preview/production ignore simulations.

All five official ShopBoard Debug Lab bugs were reproduced and their fixes verified using React and jsdom with AI assistance from Codex. See debug-lab-log.md for the observations, causes, fixes and verification. Personal Chrome/React DevTools verification remains incomplete; no manual browser testing is claimed. These lab checks are separate from the project's automated test suite.

## Tooling

Final local verification: typecheck, zero-warning lint, build, formatting check and all 44 tests across 9 suites passed. The nine protected modules and original assets match their verified baseline. Browser acceptance remains pending because the browser access host was unavailable. Installation used legacy peer resolution; `npm ls --depth=0` completed successfully and the suite ran with React 19.3.1, Vite 8.3.5, Vitest 4.1.12 and jsdom 26.1.0. npm also resolved existing development tools to plugin-react 6.2.1 and Oxlint 1.91.0 within their existing declared ranges. No runtime dependency was added.

Prettier, Oxlint, Husky and lint-staged are configured. Exact protected paths are excluded from formatting and staged writers. The two instructor-required Vercel React skills are under .claude/skills; Vite-applicable rules were applied.
