# ROSEVEIL Cosmetics — React Day 4

A Vite + React + TypeScript migration of the original ROSEVEIL concept storefront. The original ShopBoard project is read-only. This repository preserves all nine Day 3 modules from commit 731aaf7 without modification.

## Run locally

Use Node.js 24 (the development environment), then run:

```text
npm ci
npm run dev
```

The same-origin GET /api/products endpoint serves 30 original products. GET /api/products/:id serves one original product, or HTTP 404 for an unknown ID. Vite development and preview include API middleware; api/products.ts provides the original serverless handler. Static dist files alone do not provide an API server. No deployment has been performed.

## Implemented experience

Original header, hero, benefits/ribbon, categories, About expansion, Beauty Philosophy and premium footer; local demo newsletter; GLOW20 clipboard feedback; API-powered catalog; featured/all products, synchronized header/catalog search, seven categories and price sorting; loading/error/retry/API-empty/no-match states; single-image cards with reduced-motion-aware hover/focus effects; shopping bag with quantity, remove/clear, promo code, totals and persistence; product details sharing the same bag; customer information, order summary and confirmation in a local-only demo checkout.

Account/contact/policy dialogs and parallax remain unavailable. Sequential original Hero layers, subtle card hover/focus feedback, one-time section reveal and bag feedback are implemented. The header has a keyboard-accessible Light/Dark toggle using the original soft pink/beige and burgundy/rose-gold styles. No payment, real order, personal-data storage or email delivery occurs.

## Components and ownership

### Actual React component tree

Mounted by src/main.tsx inside StrictMode. One StorefrontProvider sits above BrowserRouter and all pages. App declares routes only. There are 36 reusable component files with named Props interfaces, plus App, RootLayout and seven page entry components without incoming props. Repeated names below are instances of the same component.

```text
StrictMode
`-- StorefrontProvider
    `-- BrowserRouter
        `-- App (Routes)
            `-- HomeCatalogProvider > RootLayout
                |-- SiteLayout
                |   |-- header slot: AnnouncementBar, SiteHeader
                |   |   `-- SiteHeader: MainNavigation, SearchField, ThemeToggle
                |   |-- main: Suspense > Outlet (one page below)
                |   |   |-- HomePage: HeroSection, CategorySection, AboutSection,
                |   |   |   CatalogSection, BeautyPromise (original section order)
                |   |   |   `-- HeroSection: HeroArtwork, Benefits/Ribbon DOM markup
                |   |   |-- ShopPage: PageFrame > CatalogSection
                |   |   |-- ProductDetailsPage: PageFrame > ProductDetails > ProductImage (larger detail artwork)
                |   |   |-- AboutPage: PageFrame > AboutSection, BeautyPromise
                |   |   |-- BagPage: PageFrame > ShoppingBag
                |   |   |-- CheckoutPage: PageFrame > CheckoutForm or DemoOrderConfirmation
                |   |   |   (or empty-bag DOM markup)
                |   |   `-- NotFoundPage: PageFrame > 404 DOM markup
                |   `-- footer slot: SiteFooter > NewsletterForm
                |-- StorefrontDialog > Dialog (conditional quick bag modal)
                |   `-- ShoppingBag;
                |       modal status DOM markup
                `-- Toast (empty while modal owns feedback)

CatalogSection > CatalogControls > SearchField
               > CatalogStatus
               > ProductGrid > ProductCard > ProductImage
ShoppingBag > CartRow > ProductImage (when product resolves)
            > PromoForm (nonempty bag)
CheckoutForm > OrderSummary
             > Controller (react-hook-form, four fields)
                 > Field > FieldLabel > Label (Radix primitive)
                         > input / textarea (DOM)
                         > FieldError (invalid field)
DemoOrderConfirmation > OrderSummary
```

### Routes and lazy loading

| URL           | Page                                        |
| ------------- | ------------------------------------------- |
| /             | HomePage                                    |
| /shop         | ShopPage                                    |
| /products/:id | ProductDetailsPage                          |
| /products     | ProductDetailsPage with missing-ID feedback |
| /about        | AboutPage                                   |
| /bag          | BagPage                                     |
| /checkout     | CheckoutPage (local demo)                   |
| *             | NotFoundPage (frontend 404)                 |

React Router 7.18.5 provides BrowserRouter, Routes, Outlet, Link/NavLink and URL parameters. All seven page entries use module-level React.lazy imports. Suspense surrounds Outlet, leaving Header/Footer visible during loading. Production builds emit separate page chunks; reused features can also be loaded by the shared shell. Internal navigation supports Back/Forward. PageFrame updates page titles and heading focus; Home sets its title and the layout focuses main on pathname changes.

Vite development/preview serves the SPA on direct page URLs and refresh. A future static host needs an SPA fallback for page URLs while preserving /api/* handlers. No deployment configuration or deployment was added.

### Feature organization

- src/features/catalog contains catalog components and the shared catalog navigation hook.
- src/features/cart contains bag components, dialog composition and shopping-bag UI state.
- src/features/checkout contains CheckoutForm, OrderSummary, DemoOrderConfirmation and a current-price eligibility helper that reuses protected cartTotals.
- src/features/storefront contains the shared Context/provider, React subscription hook and immutable adapter around the unchanged Day 3 store.
- src/features/navigation contains the existing navigation data.
- src/features/theme contains ThemeToggle, the DOM theme hook and the initial system-preference storage fallback.
- src/shared/motion contains the progressive section reveal hook.
- src/shared/ui contains Dialog, Toast and notification state shared across features. ProductImage remains in catalog and is reused by cart.
- src/components retains the existing layout, hero, editorial and newsletter components. Protected Day 3 modules retain their original paths.

The original migration commit is retained; Git history has not been rewritten.

### State ownership and responsibilities

| Owner / exact file                                                      | Responsibility                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App / src/App.tsx                                                       | Declares the shared layout route and module-level lazy page routes; owns no feature state.                                                                                                                                                                                                                                                                      |
| RootLayout / src/components/layout/RootLayout.tsx                       | Composes persistent Header/Footer, theme binding, catalog navigation, bag UI and notifications. Supplies catalog/bag UI callbacks through Outlet context; closes quick dialogs on route changes.                                                                                                                                                                |
| useStorefrontUi / src/features/storefront/useStorefrontUi.ts            | Reads typed Outlet UI context; creates no store or duplicate cart.                                                                                                                                                                                                                                                                                              |
| useProductDetails / src/features/catalog/useProductDetails.ts           | Owns the current ID request result and retry revision. Aborts obsolete/unmounted requests and never commits cancelled results.                                                                                                                                                                                                                                  |
| CheckoutPage / src/pages/CheckoutPage.tsx                               | Owns only a nonpersonal confirmed order summary; rechecks existing checkout logic before clearing the shared bag.                                                                                                                                                                                                                                               |
| PageFrame / src/shared/ui/PageFrame.tsx                                 | Applies the page title and focuses its heading after mount/title changes.                                                                                                                                                                                                                                                                                       |
| useCatalogNavigation / src/features/catalog/useCatalogNavigation.ts     | Each instance owns CatalogFilters and the catalog heading ref; HomeCatalogProvider owns the Home featured-first instance; RootLayout owns the independent full-collection Shop/header instance. derives active navigation and handles category/query, Home, reset, featured switching and search focus.                                                         |
| useShoppingBag / src/features/cart/useShoppingBag.ts                    | Owns bagFeedback revision (successful adds only) and activeDialog (bag only); derives bag count. Validates Add to Bag, handles quantity/removal/clear feedback and Continue Shopping. Checkout state and confirmation belong only to CheckoutPage. Persistent bag data remains in the adapter.                                                                  |
| useNotification / src/shared/ui/useNotification.ts                      | Owns notification message/revision, clipboard success/failure and the 3800ms timer with replacement/unmount cleanup.                                                                                                                                                                                                                                            |
| StorefrontDialog / src/features/cart/StorefrontDialog.tsx               | Renders only ShoppingBag and one modal status target; forwards store actions and feedback without owning state.                                                                                                                                                                                                                                                 |
| StorefrontProvider / src/features/storefront/StorefrontProvider.tsx     | Owns one stable committed adapter through lazy useState. Its effect retains catalog ownership and starts loading; cleanup releases ownership with a StrictMode-safe deferred abort. Context passes the adapter itself, without copying the cart into React state.                                                                                               |
| useStorefront / src/features/storefront/useStorefront.ts                | Reads that adapter from Context and subscribes with useSyncExternalStore. It creates no store and starts no fetch. Each consumer cleans its own subscription; calls outside the provider throw a clear error.                                                                                                                                                   |
| Adapter / src/features/storefront/storefrontAdapter.ts                  | Exclusively wraps protected createState. Copies/freezes catalog records, cart lines, profile/error and snapshot containers. Bridges catalog notifications and publishes effective cart actions. Owns request deduplication/cancellation, provider retain/release and silent cancelled-request snapshots. Each subscription owns independent idempotent cleanup. |
| Protected store / src/state.ts                                          | Owns catalog phase/data/error, cart, promo, theme and profile; preserves original localStorage behavior and internally mutable legacy implementation. React never receives the raw store.                                                                                                                                                                       |
| SiteHeader / src/components/layout/SiteHeader.tsx                       | Local menuOpen and searchOpen; effects manage focus, breakpoint changes and Escape/outside dismissal with cleanup. Query/category come from useCatalogNavigation through RootLayout.                                                                                                                                                                            |
| CatalogControls / src/features/catalog/CatalogControls.tsx              | Local open-tool ID; scoped focus and outside-pointer effect with cleanup. Filter values come from the local Home instance or the shared Shop/header instance.                                                                                                                                                                                                   |
| ProductImage / src/features/catalog/ProductImage.tsx                    | Tracks primary failure and optional secondary load/failure identities. Crossfade is enabled only after a supplied second view loads; current live mappings are empty.                                                                                                                                                                                           |
| AboutSection / src/components/editorial/AboutSection.tsx                | Local expanded story state.                                                                                                                                                                                                                                                                                                                                     |
| NewsletterForm / src/components/forms/NewsletterForm.tsx                | Local email/submitted state only; no personal-data persistence or requests.                                                                                                                                                                                                                                                                                     |
| PromoForm / src/features/cart/PromoForm.tsx                             | Local entered code and feedback string (named error in source); appliedCode comes from the store through RootLayout.                                                                                                                                                                                                                                            |
| Dialog / src/shared/ui/Dialog.tsx                                       | No React state; refs/effect manage the native dialog and restore opener focus. Close/Escape waits for a cancellable 140ms native animation, with immediate reduced-motion/unsupported fallback. useShoppingBag owns whether it exists.                                                                                                                          |
| CatalogSection, ShoppingBag, CartRow                                    | Refs support focus management. Results and totals are derived from props with protected logic; no duplicate catalog/cart state.                                                                                                                                                                                                                                 |
| useTheme / src/features/theme/useTheme.ts                               | Applies snapshot.theme to the root data-theme attribute and toggles it through the protected store action. ThemeToggle only renders props; it has no local state.                                                                                                                                                                                               |
| CheckoutForm / src/features/checkout/CheckoutForm.tsx                   | Owns typed React Hook Form state and uses Controller, zodResolver and checkout.schema.ts. Customer values stay only in mounted form memory; no store, persistence or requests. Focuses its heading on entry and RHF focuses the first invalid field.                                                                                                            |
| DemoOrderConfirmation / src/features/checkout/DemoOrderConfirmation.tsx | Renders only the confirmed item/totals snapshot and focuses its heading. No customer details are retained.                                                                                                                                                                                                                                                      |
| useScrollReveal / src/shared/motion/useScrollReveal.ts                  | SiteLayout supplies its main ref. One IntersectionObserver and a scoped MutationObserver detect lazy-page sections and reveal them once using native animations, skips focused content and reduced motion, and cleans observers/listeners/animations. No section React state or scroll listeners.                                                               |
| useHeroEntrance / src/components/hero/useHeroEntrance.ts                | HeroArtwork owns loaded asset IDs, failure, viewport entrance and reduced-motion state through this hook. It checks cached images and cleans its preference listener. Only complete scenes animate; original fallback stays visible otherwise.                                                                                                                  |
| All other components                                                    | Render props/static content and forward events; no local useState.                                                                                                                                                                                                                                                                                              |

CatalogSection derives visible results with findProducts(category, query, featured, sort, products). Header search and Shop controls share the Shop filters. Home owns independent filters: its category tiles and collection buttons stay on /, select a category and scroll with reduced-motion support. View All Products, Hero Shop Now and global Shop links navigate to /shop and reset its filters to the full collection. HomeCatalogProvider is scoped to the homepage catalog feature and sits above the layout so Home Header category buttons and homepage controls share its filters. It retains Home filters across Back/Forward; Home navigation resets to featured defaults. Shop filters persist independently in RootLayout until reset. Neither filter owner stores cart data. ProductGrid uses product.id keys; CartRow uses saved item.id. ShoppingBag derives current totals only when the full catalog is ready and all saved lines resolve. StorefrontDialog renders one notification target for modal feedback; RootLayout keeps the page Toast empty during that modal. Benefits and Signature Ribbon are markup inside HeroSection, not separate components. SiteLayout receives composed ReactNode slots; it does not own feature state.

HomeCatalogProvider (src/features/catalog/HomeCatalogProvider.tsx) owns only Home catalog filters and its heading ref. useHomeCatalog reads that feature Context; no synchronization effects or copied results are needed. Header search targets Shop, while Home category buttons filter Home.

### Shared storefront state

src/main.tsx mounts one StorefrontProvider inside StrictMode and above BrowserRouter and App. Do not mount a provider per page. Every useStorefront consumer reads the same stable adapter and actions, with cached immutable snapshots from useSyncExternalStore. No second cart or duplicate totals state was introduced. Count, pricing, discounts and visible products remain calculated using existing logic.

Consumer rerenders and page-like child remounts preserve the same store. A full provider unmount/remount creates a fresh store and restores saved cart, GLOW20 and theme through the existing persistence code. React development StrictMode may invoke the lazy initializer twice and discard an inert candidate. Store creation starts no requests or subscriptions; only the committed instance is shared. The adapter shares one in-flight promise, keeping StrictMode effect replay from issuing duplicate catalog requests. Provider cleanup schedules abort for the next task; immediate StrictMode reacquisition cancels that timer. Consumer subscription cleanup never cancels the shared request.

### Exact component prop contracts

The declarations below are copied verbatim from the named source files. App has no incoming props. ReactNode, Ref, RefObject and ComponentProps come from React. shadcn FieldProps extends native div props and the official fieldVariants orientation props (vertical, horizontal or responsive); Label props extend the Radix Label root. Product and Category come from src/modules/products/products.types.ts; CatalogFilters and CatalogPhase come from src/types/ui.types.ts; NavigationItem and NavigationId come from src/types/navigation.types.ts; StorefrontSnapshot comes from src/features/storefront/storefrontAdapter.ts. StorefrontAdapter comes from src/features/storefront/storefrontAdapter.ts; ActiveDialog comes from src/features/cart/useShoppingBag.ts. Theme comes from src/modules/state/state.types.ts. DemoOrder comes from src/features/checkout/checkout.logic.ts. These are documentation copies, not new declarations.

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
  onShopAll: () => void
  onAdd: (id: string) => void
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
  bagIsDialog?: boolean
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
  onCheckout: () => void
  activeDialog: ActiveDialog
  setActiveDialog: (value: ActiveDialog) => void
  snapshot: StorefrontSnapshot
  actions: StorefrontAdapter['actions']
  notification: { message: string; revision: number }
  changeQuantity: (id: string, delta: number) => void
  removeProduct: (id: string) => void
  clearBag: () => void
  clearNotification: () => void
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

#### src/features/storefront/StorefrontProvider.tsx

```ts
interface StorefrontProviderProps {
  children: ReactNode
}
```

#### src/features/catalog/HomeCatalogProvider.tsx

```ts
interface HomeCatalogProviderProps {
  children: ReactNode
}
```

#### src/shared/ui/PageFrame.tsx

```ts
interface PageFrameProps {
  title: string
  children: ReactNode
  width?: 'contained' | 'full'
}
```

#### src/shared/ui/shadcn/Field.tsx

```ts
interface FieldProps
  extends ComponentProps<'div'>, VariantProps<typeof fieldVariants> {}
```

#### src/shared/ui/shadcn/FieldLabel.tsx

```ts
interface FieldLabelProps extends ComponentProps<typeof Label> {}
```

#### src/shared/ui/shadcn/FieldError.tsx

```ts
interface FieldErrorProps extends ComponentProps<'div'> {
  errors?: Array<{ message?: string } | undefined>
}
```

#### src/shared/ui/shadcn/Label.tsx

```ts
interface LabelProps extends ComponentProps<typeof Root> {}
```

## Business rules and persistence

Prices are integer USD cents from the validated full catalog. GLOW20 discounts merchandise by 20%, rounded to cents. Nonempty bags pay $5.95 shipping unless discounted merchandise is strictly above $50; exactly $50 still pays shipping. Quantity is limited to 99; decrement to zero removes a row. Clear Bag clears its promo.

The protected store uses roseveil-shopping-bag-v1 with items/promoCode and supports the legacy lumiere-shopping-bag-v1 fallback. Saved prices are never trusted. Storage failure falls back to memory. Loading/error/empty catalog responses preserve saved IDs; current prices and add actions require ready product data. No payable totals are shown when prices are unavailable.

Theme choice uses the existing roseveil-theme storage key. A valid saved light/dark choice wins. With no valid saved choice, the system preference is used once at startup without saving it as a user choice. The toggle saves an explicit choice; system changes do not override the active theme. Blocked storage falls back to memory. The protected store remains the single theme owner; useTheme applies its snapshot to the HTML root. Existing reduced-motion rules remain in place, and theme switching adds no animation.

The bag keeps existing pricing and persistence rules. Quantity/removal feedback names the product, no-op changes do not claim success, and removal/clear returns focus to the bag contents. Applied promo text is read-only until REMOVE is used; invalid codes never replace a valid discount. Mobile bag controls retain 44px quantity targets, narrow layouts and scrolling dialogs. Feedback space is reserved to reduce shifts. Checkout is an enabled local demo only when the bag is nonempty and every item has current validated catalog data.

## Demo checkout

The quick shopping bag remains a native modal. Its Demo Checkout button closes it and navigates to /checkout. The /bag page uses the same ShoppingBag and navigates to the same checkout page. Checkout and confirmation now exist only on /checkout, using the shared CheckoutForm, OrderSummary and DemoOrderConfirmation. Checkout requires a nonempty bag, ready catalog and resolvable items. The customer form uses typed useForm, four Controllers and zodResolver. All required, trimmed length, email and phone rules live in src/features/checkout/checkout.schema.ts. noValidate lets Zod produce consistent field-level messages; aria-invalid and aria-describedby connect each error. Use sample details. Back to shopping bag preserves the bag and discards the entered fields. Leaving checkout also preserves the bag.

After schema validation, a valid submission reads the latest adapter snapshot and rechecks current catalog readiness, captures the item summary using the existing cartTotals function, shows a clearly labelled demo confirmation and clears the saved bag and promo. No payment, real order, email or shipping request occurs. Customer values exist only in React Hook Form memory and are never copied into the shared store, localStorage, logs or network requests, and disappear when the form unmounts. The nonpersonal confirmation summary stays in memory until the checkout page unmounts. Refresh does not retain the confirmation.

Checkout uses the routed page layout, existing responsive form styles, labels, keyboard handling and light/burgundy palette. No new motion was added. Native bag-dialog focus trapping, mobile appearance and screen-reader announcements still need real-browser acceptance.

### Official shadcn Field source

Field, FieldLabel, FieldError and their Label primitive were manually installed from the official [shadcn/ui source](https://github.com/shadcn-ui/ui/blob/c257f688cf4de7ec10cc1be84cad29cd4631182c/apps/v4/registry/new-york-v4/ui/field.tsx), revision c257f688cf4de7ec10cc1be84cad29cd4631182c. Files are under src/shared/ui/shadcn/ with the upstream MIT LICENSE and source links. Only the components checkout uses were copied; unused FieldSet/Separator components were not added. Adaptations are named Props interfaces, relative imports, one component per file, message-based error keys, and scoped ROSEVEIL slot styling. Original utility class strings are retained, but this project does not compile Tailwind; current vertical fields use the existing checkout CSS. The registry CLI was not run and no global shadcn theme or Tailwind reset was installed.

The Controller/Field pattern follows the [official React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form). These are adapted upstream components, not newly invented lookalikes. FieldError retains the upstream memoized deduplication by error message. Checkout pricing and GLOW20 still use protected cartTotals. Tests cover invalid errors/associations, first-error focus, keyboard-only completion, length limits, empty/unavailable bags, fresh-snapshot checks and confirmation clearing.

## Subtle motion and optional second photos

HeroArtwork now reuses the original stage photo and four transparent tube/pump/serum/jar assets from the original project, copied byte-for-byte. Original responsive artwork sizing, desktop centering and layer percentage positions are preserved. The tube, serum, jar and pump enter at 0/180/360/540ms with 1100ms easing after every scene image loads. Cached images are checked on mount. IntersectionObserver watches the Hero section using the original 12% entry threshold. A full viewport exit resets the layers to ready; each return plays the original sequence again. Partial visibility changes never restart it while visible. Ordinary React updates and duplicate image loads do not replay it. The observer disconnects on unmount, image failure or reduced motion. Without IntersectionObserver, the loaded entrance runs once instead. The existing flattened photo stays visible while loading, on image failure and for reduced motion. No artwork was cropped, generated or replaced. The former whole-artwork animation was removed; copy still has its gentle entrance.

Product cards show the original photo, category, real size and price with serif headings and an always-visible View details cue. Both links and Add to Bag stay visible on touch screens. The product route uses a full-page two-column presentation (stacked on mobile), breadcrumbs, a larger uncropped original image, size/collection facts, a bag link and native disclosures for accurate demo shipping and concept information. No reviews, stock claims, alternate images or product claims were invented. ProductImage supplies larger responsive sizes for the detail view. No new component state, effects or dependencies were added for the presentation.

Product cards have no continuous movement or staggered delays. The original 3px hover/focus lift, gentle image zoom and shadow remain, with smooth transitions only when reduced motion is not requested. Mouse leave or focus leaving the card restores its resting position.

Section reveals use one IntersectionObserver and native element.animate, once per section per mounted page. Baseline content is always visible; unsupported APIs leave it static. Focused sections skip the animation. Reduced-motion changes cancel active reveals, and unmount cleans observers and animations. There are no scroll listeners. The bag icon and count pulse only after successful Add to Bag, not on quantity changes, refresh or rejected additions. Close/Escape keeps the native modal open during its short close animation and restores focus after it finishes; navigation out of the modal can close immediately. CSS motion is restricted to no-preference, and secondary swapping remains static on reduced motion.

ProductImage accepts an optional secondaryImage URL. It lazily loads the second view in the same reserved image box, enables a 350ms hover/focus crossfade only after load, and retains the primary after a loading failure. Touch controls remain usable. src/features/catalog/secondaryImages.ts intentionally has no live mappings: all inspected product assets are primary photos or responsive sizes, with no verified alternate views. No product-card photos were created, replaced or duplicated; five original Hero stage/layer assets were copied separately. Tests simulate a future secondary URL; they do not claim a new real photograph exists.

## Safe API cancellation and single-product preparation

The protected API client remains the request/JSON-validation entry point. src/shared/api/abortableFetch.ts is an injected transport wrapper, not a replacement API client. It passes AbortSignal to fetch and races the small JSON response through body loading, preventing late or signal-ignoring transports from committing cancelled results.

The React storefront adapter owns one AbortController and one promise per catalog request. Concurrent loads share that promise. cancelCatalog aborts a pending request and exposes an idle snapshot with no cancellation error. A retry requested during cancellation waits for the protected store to finish its old load before starting again. Pending retries expose loading without leaking the old cancellation error, and Add to Bag remains blocked until current data is ready. Saved cart/promo/theme data is preserved.

Only StorefrontProvider calls retainCatalog. Last-owner release defers cancellation by one zero-delay timer, so StrictMode cleanup/setup keeps the same request. Real provider unmount cancels pending work. Unsubscribing a page or the last consumer while the provider remains mounted does not abort shared loading. Release callbacks are idempotent, and reacquisition clears the cleanup timer.

src/features/catalog/api/productDetails.api.ts exports getProductById(id, { signal, fetcher }). It uses fetchJson, validates every Product field and the response ID, rejects malformed IDs before network access, and forwards cancellation. The default abort rejection is AbortError; callers should check signal.aborted to distinguish cancellation from real errors. Product validation lives in product.validation.ts because the protected collection validator is private and remains untouched.

Vite middleware and api/products/[id].ts share server/product-by-id.ts for GET /api/products/:id. The response is one original Product object; missing IDs return 404, malformed IDs return 400, unsupported methods return 405 and responses use no-store. The existing collection endpoint and its development simulations are unchanged. ProductDetailsPage reads useParams and useProductDetails fetches this endpoint independently of the catalog. Invalid IDs, missing products, loading, errors and Retry have separate feedback. ID changes/unmount abort obsolete requests. Adding requires matching current shared-catalog prices; unavailable catalog data offers Reload collection.

## Verification

```text
npm run typecheck
npm run lint
npm run build
npm run format:check
npm test
```

Tests also cover route entries/titles/focus, Back/Forward, BrowserRouter direct URLs, shared cart across pages, routed demo checkout, product request retry/cancellation and lazy-page fallback with persistent Header/Footer. Checkout tests also verify popup-to-page navigation, back-to-bag editing, and cart/price changes during asynchronous validation. Tests cover API validation/methods, catalog selection, snapshot/subscription behavior, shared Context consumers and page-like remounts, refresh-equivalent persistence, missing-provider errors and StrictMode store stability, cancellation/late responses/body loading/immediate retries, provider cleanup/rapid remounts, validated single-product requests and invalid IDs, cart persistence/limits/discounts, real React StrictMode loading, modal interactions and synchronized search, theme defaults/persistence/keyboard switching/storage failures, bag remount/clear/quantity limits and focus after removal, and demo checkout validation/confirmation/back/empty/error/cart clearing, image swap load/failure fallback, product grid actions without floating metadata, reveal cleanup/reduced motion and animated dialog focus restoration. The suite limits concurrent jsdom workers to two and allows 15 seconds per test for full storefront interaction workflows. jsdom modal methods are simulated: native focus trapping, real keyboard/browser behavior, clipboard permissions, mobile visual parity, reduced motion and console/asset checks still require browser acceptance.

Development-only URLs: ?api-delay=1000, ?api-error=500, ?api-empty=1. Forced failures remain forced during Retry; automated recovery tests replace a failing response with success in the same mounted app. Preview/production ignore simulations.

All five official ShopBoard Debug Lab bugs were reproduced and their fixes verified using React and jsdom with AI assistance from Codex. See debug-lab-log.md for the observations, causes, fixes and verification. Personal Chrome/React DevTools verification remains incomplete; no manual browser testing is claimed. These lab checks are separate from the project's automated test suite.

## Tooling

Final local verification: typecheck, zero-warning lint, build, formatting check and all 91 tests across 17 suites passed. The nine protected modules and original assets match their verified baseline. The student reports successful browser checks for routing, Home/Shop navigation, and the shared bag/checkout flow. Native screen-reader behavior remains unverified. Installation used legacy peer resolution; `npm ls --depth=0` completed successfully and the suite ran with React 19.3.1, Vite 8.3.5, Vitest 4.1.12 and jsdom 26.1.0. npm also resolved existing development tools to plugin-react 6.2.1 and Oxlint 1.91.0 within their existing declared ranges. Routing uses React Router 7.18.5. Checkout uses react-hook-form 7.91.0, zod 4.6.7 and @hookform/resolvers 5.9.2. Official shadcn Field support uses @radix-ui/react-label 2.1.17, class-variance-authority 0.7.1, clsx 2.1.1 and tailwind-merge 3.7.0.

Prettier, Oxlint, Husky and lint-staged are configured. Exact protected paths are excluded from formatting and staged writers. The two instructor-required Vercel React skills are under .claude/skills; Vite-applicable rules were applied.
