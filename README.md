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

Original header, hero, benefits/ribbon, categories, About expansion, Beauty Philosophy and premium footer; local demo newsletter; GLOW20 clipboard feedback; API-powered catalog; featured/all products, synchronized header/catalog search, seven categories and price sorting; loading/error/retry/API-empty/no-match states; single-image cards with reduced-motion-aware hover/focus effects; shopping bag with quantity, remove/clear, promo code, totals and persistence; product details sharing the same bag.

Theme switching, account/contact/policy dialogs, checkout and optional cinematic/floating/scroll/parallax animations remain unavailable. Dark CSS is preserved, but no theme switch control is enabled. No payment, real order, personal-data storage or email delivery occurs.

## Components and ownership

### Actual React component tree

Mounted by src/main.tsx inside StrictMode. The tree below includes all 24 reusable component files; repeated appearances are instances of the same component. DOM-only markup is labelled explicitly.

```text
App (src/App.tsx; root, no incoming props)
|-- SiteLayout
|   |-- header slot (created by App)
|   |   |-- AnnouncementBar
|   |   `-- SiteHeader
|   |       |-- MainNavigation
|   |       `-- SearchField (header search)
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
|-- Dialog (conditional; one native modal)
|   |-- ShoppingBag (bag branch)
|   |   |-- CartRow (one per saved line)
|   |   |   `-- ProductImage (cart variant, if product resolves)
|   |   `-- PromoForm (nonempty bag)
|   |-- ProductDetails (alternative product branch, if product resolves)
|   |   `-- ProductImage (detail variant)
|   `-- modal status markup (owned/rendered by App)
`-- Toast (empty while the modal owns feedback)
```

### State ownership and responsibilities

| Owner / exact file                                           | Responsibility                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App / src/App.tsx                                            | Owns activeDialog, the shared CatalogFilters object and notification message/revision. Derives bag count, selected product and active navigation; passes typed actions downward. Its effect clears the notification timer on replacement/unmount.                  |
| useStorefront / src/hooks/useStorefront.ts                   | Lazily owns one adapter per mounted App. useSyncExternalStore reads its stable cached snapshots and cleans subscriptions; an effect starts catalog loading. StrictMode may invoke the discarded initializer, but no request/subscription is started during render. |
| Adapter / src/state/storefrontAdapter.ts                     | Exclusively wraps protected createState. Copies/freezes catalog records, cart lines, profile/error and snapshot containers. Bridges catalog notifications and publishes effective cart actions. Each subscription owns independent idempotent cleanup.             |
| Protected store / src/state.ts                               | Owns catalog phase/data/error, cart, promo, theme and profile; preserves original localStorage behavior and internally mutable legacy implementation. React never receives the raw store.                                                                          |
| SiteHeader / src/components/layout/SiteHeader.tsx            | Local menuOpen and searchOpen; effects manage focus, breakpoint changes and Escape/outside dismissal with cleanup. Query/category come from App.                                                                                                                   |
| CatalogControls / src/components/catalog/CatalogControls.tsx | Local open-tool ID; scoped focus and outside-pointer effect with cleanup. Filter values come from App.                                                                                                                                                             |
| ProductImage / src/components/catalog/ProductImage.tsx       | Local failed-image identity for the accessible fallback; no hover state or secondary images.                                                                                                                                                                       |
| AboutSection / src/components/editorial/AboutSection.tsx     | Local expanded story state.                                                                                                                                                                                                                                        |
| NewsletterForm / src/components/forms/NewsletterForm.tsx     | Local email/submitted state only; no personal-data persistence or requests.                                                                                                                                                                                        |
| PromoForm / src/components/cart/PromoForm.tsx                | Local entered code and feedback string (named error in source); appliedCode comes from the store through App.                                                                                                                                                      |
| Dialog / src/components/shared/Dialog.tsx                    | No React state; ref/effect opens and cleans the native dialog and restores opener focus. App owns whether it exists.                                                                                                                                               |
| CatalogSection, ShoppingBag, CartRow                         | Refs support focus management. Results and totals are derived from props with protected logic; no duplicate catalog/cart state.                                                                                                                                    |
| All other components                                         | Render props/static content and forward events; no local useState.                                                                                                                                                                                                 |

CatalogSection derives visible results with findProducts(category, query, featured, sort, products). Shared header/catalog searches and all category navigation update App's filters. ProductGrid uses product.id keys; CartRow uses saved item.id. ShoppingBag derives current totals only when the full catalog is ready and all saved lines resolve. App renders one notification target for modal feedback and keeps the page Toast empty during that modal. Benefits and Signature Ribbon are markup inside HeroSection, not separate components. SiteLayout receives composed ReactNode slots; it does not own App state.

### Exact component prop contracts

The declarations below are copied verbatim from the named source files. App has no incoming props. ReactNode, Ref and RefObject come from React. Product and Category come from src/modules/products/products.types.ts; CatalogFilters and CatalogPhase come from src/types/ui.types.ts; NavigationItem and NavigationId come from src/types/navigation.types.ts; StorefrontSnapshot comes from src/state/storefrontAdapter.ts. These are documentation copies, not new declarations.

#### src/components/cart/CartRow.tsx

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

#### src/components/cart/PromoForm.tsx

```ts
interface PromoFormProps {
  appliedCode: string
  onApply: (value: string) => void
}
```

#### src/components/cart/ShoppingBag.tsx

```ts
interface ShoppingBagProps {
  snapshot: StorefrontSnapshot
  onQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onPromo: (code: string) => void
  onContinue: () => void
  onRetry: () => Promise<void>
}
```

#### src/components/catalog/CatalogControls.tsx

```ts
interface CatalogControlsProps {
  filters: CatalogFilters
  onChange: (filters: CatalogFilters) => void
}
```

#### src/components/catalog/CatalogSection.tsx

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

#### src/components/catalog/CatalogStatus.tsx

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

#### src/components/catalog/ProductCard.tsx

```ts
interface ProductCardProps {
  product: Readonly<Product>
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}
```

#### src/components/catalog/ProductDetails.tsx

```ts
interface ProductDetailsProps {
  product: Readonly<Product>
  available: boolean
  onAdd: (id: string) => void
}
```

#### src/components/catalog/ProductGrid.tsx

```ts
interface ProductGridProps {
  products: readonly Readonly<Product>[]
  onAdd: (id: string) => void
  onDetails: (id: string) => void
}
```

#### src/components/catalog/ProductImage.tsx

```ts
interface ProductImageProps {
  product: Readonly<Product>
  variant?: 'card' | 'detail' | 'cart'
}
```

#### src/components/catalog/SearchField.tsx

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

#### src/components/shared/Dialog.tsx

```ts
interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
}
```

#### src/components/shared/Toast.tsx

```ts
interface ToastProps {
  message: string
  announcementId: number
}
```

## Business rules and persistence

Prices are integer USD cents from the validated full catalog. GLOW20 discounts merchandise by 20%, rounded to cents. Nonempty bags pay $5.95 shipping unless discounted merchandise is strictly above $50; exactly $50 still pays shipping. Quantity is limited to 99; decrement to zero removes a row. Clear Bag clears its promo.

The protected store uses roseveil-shopping-bag-v1 with items/promoCode and supports the legacy lumiere-shopping-bag-v1 fallback. Saved prices are never trusted. Storage failure falls back to memory. Loading/error/empty catalog responses preserve saved IDs; current prices and add actions require ready product data. No payable totals are shown when prices are unavailable.

## Verification

```text
npm run typecheck
npm run lint
npm run build
npm run format:check
npm test
```

Tests cover API validation/methods, catalog selection, snapshot/subscription behavior, cart persistence/limits/discounts, real React StrictMode loading, modal interactions and synchronized search. jsdom modal methods are simulated: native focus trapping, real keyboard/browser behavior, clipboard permissions, mobile visual parity, reduced motion and console/asset checks still require browser acceptance.

Development-only URLs: ?api-delay=1000, ?api-error=500, ?api-empty=1. Forced failures remain forced during Retry; automated recovery tests replace a failing response with success in the same mounted app. Preview/production ignore simulations.

All five official ShopBoard Debug Lab bugs were reproduced and their fixes verified using React and jsdom with AI assistance from Codex. See debug-lab-log.md for the observations, causes, fixes and verification. Personal Chrome/React DevTools verification remains incomplete; no manual browser testing is claimed. These lab checks are separate from the project's automated test suite.

## Tooling

Final local verification: typecheck, zero-warning lint, build, formatting check and all 13 tests across 3 suites passed. The nine protected modules and original assets match their verified baseline. Browser acceptance remains pending because the browser access host was unavailable. Installation used legacy peer resolution; `npm ls --depth=0` completed successfully and the suite ran with React 19.3.1, Vite 8.3.5, Vitest 4.1.12 and jsdom 26.1.0. npm also resolved existing development tools to plugin-react 6.2.1 and Oxlint 1.91.0 within their existing declared ranges. No runtime dependency was added.

Prettier, Oxlint, Husky and lint-staged are configured. Exact protected paths are excluded from formatting and staged writers. The two instructor-required Vercel React skills are under .claude/skills; Vite-applicable rules were applied.
