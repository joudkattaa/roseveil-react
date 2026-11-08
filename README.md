# ROSEVEIL Cosmetics - React Task 5

ROSEVEIL is my original cosmetics concept storefront, rebuilt with Vite, React and TypeScript.
It keeps my original product images, soft pink and beige light theme, burgundy dark theme and elegant layout.
The original ShopBoard project is read-only. All nine protected Day 3 modules remain unchanged from commit 731aaf7.

## Install and run

Use Node.js 24 and npm. From the repository root, run:

```text
npm ci
npm run dev
```

Open the local URL printed by Vite. To build and preview locally:

```text
npm run build
npm run preview
```

Vite development and preview provide the product API middleware.
Static dist files alone do not provide an API server. No deployment has been performed.

## Features and design

- Browse 30 original products with search, seven categories, featured products and price sorting.
- Open product details, manage a shared shopping bag and use the GLOW20 discount.
- Switch between saved light and burgundy themes and complete a local demo checkout.
- Keep the original Home sections, four-layer Hero entrance and viewport replay.
- Use subtle card hover/focus feedback, section reveals and reduced-motion support.

Product cards remain still outside hover/focus. No verified secondary product photos are available, so the original photos remain in use.
My aim is to improve my original design while keeping it recognizable. See [VISION.md](VISION.md).

## React component tree

App is the top of the application tree. The actual runtime wrappers in src/main.tsx sit above it:

```text
StrictMode (React; children)
  StorefrontProvider [src/features/storefront/StorefrontProvider.tsx] | props: { children: ReactNode }
    BrowserRouter (React Router; children)
      App (application tree below)
```

Each local component has its source path and actual prop types below. Repeated appearances use the same
contract; shorter repeated entries identify the props supplied there. ? marks optional props.
key is React metadata, not a component prop. Indentation shows parent/child relationships and ReactNode slots.
Route alternatives and conditional branches are labelled; they do not all mount together.
Shared branches are expanded once below. React, React Router, React Hook Form and Radix infrastructure is labelled;
ordinary HTML and repeated Link/NavLink elements are not expanded.
StorefrontProvider supplies StorefrontContext with value={adapter}; HomeCatalogProvider supplies HomeCatalogContext with value={catalog}.

```text
App [src/App.tsx] | props: none
  Routes / Route (React Router selects a route)
    HomeCatalogProvider [src/features/catalog/HomeCatalogProvider.tsx] | props: { children: ReactNode }
      RootLayout [src/components/layout/RootLayout.tsx] | props: none
        SiteLayout [src/components/layout/SiteLayout.tsx] | props: { children: ReactNode; header: ReactNode; footer: ReactNode }
          header slot
            AnnouncementBar [src/components/layout/AnnouncementBar.tsx] | props: { onCopyCode: () => Promise<void> }
            SiteHeader [src/components/layout/SiteHeader.tsx] | props: { bagIsDialog?: boolean; bagFeedback: number; theme: Theme; onToggleTheme: () => void; bagCount: number; onOpenBag: () => void; items: readonly NavigationItem[]; activeId: NavigationId | undefined; unavailableMessage: string; query: string; onQueryChange: (value: string) => void; onSearchSubmit: () => void; onCategoryChange: (value: Category | 'All') => void; onHome: () => void }
              MainNavigation [src/components/layout/MainNavigation.tsx] | props: { open: boolean; items: readonly NavigationItem[]; activeId: NavigationId | undefined; onNavigate: () => void; onCategoryChange: (value: Category | 'All') => void; onHome: () => void; navigationRef: Ref<HTMLElement> }
              ThemeToggle [src/features/theme/ThemeToggle.tsx] | props: { theme: Theme; onToggle: () => void }
              SearchField [src/features/catalog/SearchField.tsx] | props: { children?: ReactNode; id: string; label: string; value: string; placeholder: string; inputRef?: Ref<HTMLInputElement>; onChange: (value: string) => void }
          children slot: main > Suspense > Outlet
            LazyPage [src/shared/ui/LazyPage.tsx] | props: { initial: LazyExoticComponent<ComponentType>; load: () => Promise<{ default: ComponentType }> }
              ErrorBoundary [src/shared/ui/ErrorBoundary.tsx] | props: { children: ReactNode; label: string; onRetry?: () => void }
                selected page (one of these alternatives)
                  HomePage [src/pages/HomePage.tsx] | props: none
                    HeroSection [src/components/hero/HeroSection.tsx] | props: { onExplore: () => void }
                      HeroArtwork [src/components/hero/HeroArtwork.tsx] | props: { accessibleLabel: string }
                    CategorySection [src/components/editorial/CategorySection.tsx] | props: { category: Category | 'All' | null; onSelect: (category: Category) => void }
                    AboutSection [src/components/editorial/AboutSection.tsx] | props: { storyId: string }
                    ErrorBoundary (label="The product collection", children)
                      CatalogSection [src/features/catalog/CatalogSection.tsx] | props: { onShopAll: () => void; onAdd: (id: string) => void; products: readonly Readonly<Product>[]; phase: CatalogPhase; catalogEmpty: boolean; filters: CatalogFilters; onFiltersChange: (value: CatalogFilters) => void; onCategoryChange: (value: Category | 'All') => void; onRetry: () => Promise<void>; onReset: () => void; onToggleFeatured: () => void; headingRef: RefObject<HTMLHeadingElement | null> } (catalog branch below)
                    BeautyPromise [src/components/editorial/BeautyPromise.tsx] | props: { headingId: string }
                  ShopPage [src/pages/ShopPage.tsx] | props: none
                    PageFrame [src/shared/ui/PageFrame.tsx] | props: { title: string; children: ReactNode; width?: 'contained' | 'full' }
                      ErrorBoundary (label="The product collection", children)
                        CatalogSection (catalog branch below)
                  ProductDetailsPage [src/pages/ProductDetailsPage.tsx] | props: none
                    PageFrame (title, children)
                      ProductDetails [src/features/catalog/ProductDetails.tsx] | props: { product: Readonly<Product>; available: boolean; onAdd: (id: string) => void } (when product data exists)
                        ProductImage [src/features/catalog/ProductImage.tsx] | props: { secondaryImage?: string; product: Readonly<Product>; variant?: 'card' | 'detail' | 'cart' } (product, variant="detail")
                  AboutPage [src/pages/AboutPage.tsx] | props: none
                    PageFrame (title, width="full", children)
                      AboutSection (storyId)
                      BeautyPromise (headingId)
                  BagPage [src/pages/BagPage.tsx] | props: none
                    PageFrame (title, children)
                      ShoppingBag [src/features/cart/ShoppingBag.tsx] | props: { onCheckout: () => void; snapshot: StorefrontSnapshot; onQuantity: (id: string, delta: number) => void; onRemove: (id: string) => void; onClear: () => void; onPromo: (code: string) => void; onContinue: () => void; onRetry: () => Promise<void> } (bag branch below)
                  CheckoutPage [src/pages/CheckoutPage.tsx] | props: none
                    PageFrame (title, children)
                      CheckoutForm [src/features/checkout/CheckoutForm.tsx] | props: { order: DemoOrder | null; onBack: () => void; onConfirm: () => void } (unconfirmed, nonempty bag; checkout branch below)
                      DemoOrderConfirmation [src/features/checkout/DemoOrderConfirmation.tsx] | props: { order: DemoOrder; onContinue: () => void } (confirmed; confirmation branch below)
                      empty-bag message and Link (otherwise)
                  NotFoundPage [src/pages/NotFoundPage.tsx] | props: none
                    PageFrame (title, children)
          footer slot
            SiteFooter [src/components/layout/SiteFooter.tsx] | props: { unavailableMessage: string; onHome: () => void; onShop: () => void }
              NewsletterForm [src/components/forms/NewsletterForm.tsx] | props: { confirmationMessage: string }
        StorefrontDialog [src/features/cart/StorefrontDialog.tsx] | props: { onCheckout: () => void; activeDialog: ActiveDialog; setActiveDialog: (value: ActiveDialog) => void; snapshot: StorefrontSnapshot; actions: StorefrontAdapter['actions']; notification: { message: string; revision: number }; changeQuantity: (id: string, delta: number) => void; removeProduct: (id: string) => void; clearBag: () => void; clearNotification: () => void; continueShopping: () => void }
          Dialog [src/shared/ui/Dialog.tsx] | props: { title: string; onClose: () => void; children: ReactNode } (only while activeDialog is set)
            ShoppingBag (bag branch below)
        Toast [src/shared/ui/Toast.tsx] | props: { message: string; announcementId: number }

Catalog branch (HomePage and ShopPage):
CatalogSection [src/features/catalog/CatalogSection.tsx] | props: { onShopAll: () => void; onAdd: (id: string) => void; products: readonly Readonly<Product>[]; phase: CatalogPhase; catalogEmpty: boolean; filters: CatalogFilters; onFiltersChange: (value: CatalogFilters) => void; onCategoryChange: (value: Category | 'All') => void; onRetry: () => Promise<void>; onReset: () => void; onToggleFeatured: () => void; headingRef: RefObject<HTMLHeadingElement | null> }
  CatalogControls [src/features/catalog/CatalogControls.tsx] | props: { filters: CatalogFilters; onChange: (filters: CatalogFilters) => void }
    SearchField (id, label, value, placeholder, onChange)
  CatalogStatus [src/features/catalog/CatalogStatus.tsx] | props: { resultCount: number; category: Category | 'All'; onReset: () => void; retryRef: Ref<HTMLButtonElement>; phase: CatalogPhase; catalogEmpty: boolean; onRetry: () => Promise<void> }
  ProductGrid [src/features/catalog/ProductGrid.tsx] | props: { products: readonly Readonly<Product>[]; onAdd: (id: string) => void }
    ProductCard [src/features/catalog/ProductCard.tsx] | props: { product: Readonly<Product>; onAdd: (id: string) => void } (one per product)
      ProductImage [src/features/catalog/ProductImage.tsx] | props: { secondaryImage?: string; product: Readonly<Product>; variant?: 'card' | 'detail' | 'cart' }

Bag branch (BagPage or StorefrontDialog > Dialog):
ShoppingBag [src/features/cart/ShoppingBag.tsx] | props: { onCheckout: () => void; snapshot: StorefrontSnapshot; onQuantity: (id: string, delta: number) => void; onRemove: (id: string) => void; onClear: () => void; onPromo: (code: string) => void; onContinue: () => void; onRetry: () => Promise<void> }
  CartRow [src/features/cart/CartRow.tsx] | props: { id: string; product: Readonly<Product> | undefined; quantity: number; pricesAvailable: boolean; onQuantity: (id: string, delta: number) => void; onRemove: (id: string) => void; onRowRemoved: () => void } (one per saved item, when nonempty)
    ProductImage (product, variant="cart"; only when product data exists)
  PromoForm [src/features/cart/PromoForm.tsx] | props: { appliedCode: string; onApply: (value: string) => void } (when nonempty)

Checkout branch (CheckoutPage):
CheckoutForm [src/features/checkout/CheckoutForm.tsx] | props: { order: DemoOrder | null; onBack: () => void; onConfirm: () => void }
  OrderSummary [src/features/checkout/OrderSummary.tsx] | props: { order: DemoOrder } (only when order is available)
  Controller (react-hook-form; name, control, render; one per customer field)
    Field [src/shared/ui/shadcn/Field.tsx] | props: ComponentProps<'div'> & VariantProps<typeof fieldVariants>
      FieldLabel [src/shared/ui/shadcn/FieldLabel.tsx] | props: ComponentProps<typeof Label>
        Label [src/shared/ui/shadcn/Label.tsx] | props: ComponentProps<typeof Root>
          LabelPrimitive.Root (Radix Root; forwarded Label props)
      input / textarea (native HTML)
      FieldError [src/shared/ui/shadcn/FieldError.tsx] | props: ComponentProps<'div'> & { errors?: Array<{ message?: string } | undefined> } (only when invalid)

Confirmation branch (CheckoutPage):
DemoOrderConfirmation [src/features/checkout/DemoOrderConfirmation.tsx] | props: { order: DemoOrder; onContinue: () => void }
  OrderSummary (order)
```

The shadcn/ui inherited types above match their interfaces. Field inherits native div props and
fieldVariants orientation variants (vertical, horizontal, responsive). FieldError inherits native div props
plus its optional errors array. FieldLabel inherits Label props; Label inherits Radix Root props.
Children, className, HTML attributes and refs remain inherited rather than replaced by a simplified interface.
Benefits and the ribbon are markup inside HeroSection, rather than separate components.
The shared layout stays mounted while the selected page changes; the quick bag mounts only when opened.

## Routes and shared layout

| URL           | Page                                        |
| ------------- | ------------------------------------------- |
| /             | HomePage                                    |
| /shop         | ShopPage                                    |
| /products/:id | ProductDetailsPage                          |
| /products     | ProductDetailsPage with missing-ID feedback |
| /about        | AboutPage                                   |
| /bag          | BagPage                                     |
| /checkout     | CheckoutPage and local demo confirmation    |
| *             | NotFoundPage (404)                          |

All seven page components use React.lazy. Suspense displays a page-loading fallback.
RootLayout keeps the header, footer, theme and bag available outside page Error Boundaries.
Navigation supports Back/Forward. A future static host needs an SPA fallback that preserves API routes.

## Folder organization

- src/components: shared layout, Hero, editorial sections and newsletter.
- src/features/catalog: catalog controls, cards, product details and catalog navigation.
- src/features/cart: shopping bag, promo form and quick-bag UI.
- src/features/checkout: customer form, validation, order summary and demo confirmation.
- src/features/storefront: shared Context, provider, subscription hook and adapter.
- src/features/theme and src/features/navigation: theme behavior and navigation data.
- src/shared: API helpers, motion utilities, dialogs, feedback and adapted shadcn/ui components.
- src/pages: route entry components; src/styles: original responsive and theme styles.
- server and api: local middleware and serverless product handlers; tests: automated checks.

## How Task 4 feedback was addressed

The earlier feedback highlighted a large App component, organization and commit structure.
The project now separates routing, feature behavior and reusable presentation so the code is easier to review.

- App.tsx assembles routes and lazy page entries instead of holding the whole storefront UI.
- RootLayout composes the persistent header/footer, navigation, bag UI and page outlet.
- Catalog, cart, checkout, theme and storefront integration live in their own feature folders.
- Reusable components have their own files and named, explicit Props interfaces.
- Shared UI such as Dialog, Toast and ErrorBoundary is kept outside individual features.

This makes responsibilities easier to explain: route files select a page, feature hooks manage related behavior, and components render typed inputs.
The protected Day 3 logic remains in its original paths, with React integration built around it.

The local history also records separate logical changes rather than one unexplained rewrite.
Examples include Group related files by feature, Split App into smaller parts, Add shared state and React Router, and Validate checkout with React Hook Form and Zod.
Later commits separately cover product presentation and loading/error/empty behavior.
This history lets a reviewer follow what changed and why without rewriting earlier commits.

## Shared cart state

### One store for every page

The shopping bag must show the same products on Home, Shop, product details and checkout.
A separate cart inside each page would lose or disagree about items when navigation changes the page.
For this reason, src/main.tsx mounts one StorefrontProvider above BrowserRouter.
The provider remains mounted while route pages change.

StorefrontProvider creates one stable adapter with a lazy useState initializer.
It passes that adapter through StorefrontContext so pages do not need to create their own stores.
Context makes the shared adapter available; it does not hold a second copy of the cart.
The provider effect starts catalog loading and releases catalog ownership during cleanup.

### The adapter and subscription hook

The original Day 3 store is kept in src/state.ts and is not rewritten for React.
The adapter in src/features/storefront/storefrontAdapter.ts connects that store to React.
It gives React copied, frozen snapshots instead of exposing the mutable legacy store.
A snapshot is the current view of catalog data, cart items, promo code and theme.
It keeps the same identity until the visible store data changes.

Components call useStorefront to read this shared adapter.
The hook uses Context to find it and useSyncExternalStore to subscribe to changes.
When store data changes, subscribers receive the current snapshot and React updates the relevant UI.
Calling the hook outside StorefrontProvider produces a clear error.
The hook does not start requests or create a private cart.

### Actions and the Add to Bag flow

Components receive typed callbacks or call the shared actions for changes.
Actions include adding a product, changing quantity, removing an item, clearing the bag and applying a promo code.
They use the existing store behavior, then publish an updated snapshot when data actually changes.
Components do not modify snapshot objects or cart arrays directly.

For example, clicking Add to Bag follows this sequence:

1. The UI passes the product ID to the bag handler.
2. The adapter checks that current catalog data is available before adding.
3. The protected store updates the shared bag using its existing rules.
4. The adapter publishes the new immutable snapshot.
5. Consumers display the updated count, rows and totals from that same data.

This keeps the header bag count, quick bag, /bag page and checkout consistent.
Adding from product details uses the same shared bag as adding from a product card.

### Persistence and pricing

The protected store saves bag items and the promo code under roseveil-shopping-bag-v1.
It also supports the existing legacy lumiere-shopping-bag-v1 fallback.
Theme selection uses the separate roseveil-theme key.
Refreshing restores saved choices; unavailable storage falls back to memory.
Customer checkout details are never part of this persistence.

Saved prices are not trusted as current prices.
If the catalog is loading, empty or unavailable, saved bag IDs remain intact.
The UI explains that current prices are unavailable and prevents invalid adding or checkout.
This avoids presenting an old saved price as a valid payable total.

Prices use integer cents. GLOW20 discounts merchandise by 20%, rounded to cents.
Shipping costs $5.95 unless discounted merchandise is strictly above $50.
Exactly $50 still pays shipping. Quantity is limited to 99; reducing it to zero removes the row.
Clearing the bag also clears its promo code.

## Local state and derived values

State belongs to the component that calls its hook. Context and Outlet share existing owners' values;
consuming useStorefront does not create another store.

| Owner                                            | State and responsibility                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| StorefrontProvider                               | Keeps one stable adapter wrapping the Day 3 store for catalog/API status, cart, promo, theme and profile. The provider owns shared catalog request lifetime. |
| HomeCatalogProvider through useCatalogNavigation | Home category, query, sort and featured filters, retained across navigation.                                                                                 |
| RootLayout through useCatalogNavigation(false)   | Shop filters, also used by header search. Outlet context exposes this catalog controller and the bag controller to pages.                                    |
| RootLayout through useShoppingBag                | activeDialog and bagFeedback. Cart contents remain shared.                                                                                                   |
| RootLayout through useNotification               | Notification message and revision, including timed dismissal and copy-code feedback.                                                                         |
| SiteHeader                                       | menuOpen and searchOpen.                                                                                                                                     |
| AboutSection                                     | expanded story visibility.                                                                                                                                   |
| NewsletterForm                                   | Temporary email and submitted feedback; submission clears the email.                                                                                         |
| CatalogControls                                  | Which search/category/sort popup is open. Filter values come through props.                                                                                  |
| PromoForm                                        | Draft code value and feedback/error. The applied code remains shared.                                                                                        |
| ProductImage                                     | failedImage, loadedSecondary and failedSecondary image status.                                                                                               |
| HeroArtwork through useHeroEntrance              | Loaded asset IDs, failure, reduced-motion preference and entrance phase. active is derived.                                                                  |
| ProductDetailsPage through useProductDetails     | Request result and retry attempt. Display state is derived from those and the route ID; obsolete requests are aborted.                                       |
| CheckoutForm through React Hook Form             | Temporary customer values, validation errors and submission state. Customer details are not stored or sent.                                                  |
| CheckoutPage                                     | confirmed demo order in page memory, without customer details.                                                                                               |
| LazyPage                                         | Current lazy page component; retry creates a fresh lazy instance.                                                                                            |
| ErrorBoundary                                    | failed render flag, reset by its Try Again action.                                                                                                           |

App assembles routes and does not own cart or product state. useTheme applies the shared theme to the document;
it does not own another theme value. Other components receive props or consume these existing owners.
Refs for focus, dialogs, animation and observers are implementation handles rather than duplicate business state.

Counts, visible products, discounts, checkout eligibility and totals are calculated from current inputs.
For example, the bag count comes from item quantities and filtered products come from the catalog plus filters.
Storing these results again would require extra updates and could let them become out of sync.
Existing product-selection and cart-total logic is reused instead of duplicated.

## Product API requests

### Catalog and product details

GET /api/products returns the validated collection of 30 original products.
The provider starts the shared catalog request through the adapter.
Concurrent catalog loads share one in-flight promise instead of sending duplicate requests.

ProductDetailsPage reads the product ID from /products/:id.
Its useProductDetails hook requests GET /api/products/:id separately from the collection request.
This lets a direct product URL show its own loading, unavailable-product or retry feedback.
The API returns HTTP 404 for an unknown product and rejects malformed IDs.
The /products route explains that an ID is missing.

### Validation before display

The existing API client handles requests and JSON parsing.
Runtime validation checks response data before it becomes usable product data.
TypeScript describes expected types, but it cannot guarantee that a server returned valid JSON fields.
Single-product validation also checks that the returned ID matches the requested ID.

Product details may load independently, but adding still requires matching current shared-catalog data.
A successful detail response alone does not authorize checkout with unavailable catalog prices.
When necessary, the detail page offers a way to reload the collection.

### Cancellation and retries

When the detail ID changes or the detail page unmounts, its obsolete request is aborted.
Late results are prevented from replacing the current product result.
Intentional cancellation is not presented as an API failure.

Shared catalog cancellation belongs to the provider, rather than each subscribing page.
Unsubscribing one component must not cancel a request another page or component still needs.
Provider cleanup safely releases ownership, including React StrictMode's development effect replay.
An actual provider unmount can cancel remaining catalog work.

Retry buttons perform a new request instead of only hiding the error message.
A retry during cancellation waits for the old catalog load to finish cleaning up.
Bag and theme data stay available while request feedback changes.

## Demo checkout

### One checkout route

The quick bag and /bag both navigate to the single /checkout flow.
Checkout requires a nonempty bag with valid current prices for every item.
The page shows the order summary, customer form and then a clearly labelled demo confirmation.
Going back to the bag preserves its contents so they can be edited.

### React Hook Form and Zod

CheckoutForm uses typed React Hook Form to manage input values, errors and submission state.
Controller connects each of the four fields to that form state.
zodResolver applies the single checkoutSchema from checkout.schema.ts.
The schema validates full name, email, phone and address, including trimmed values and length limits.
Keeping validation together avoids separate rules that disagree between fields or submission handlers.

Errors are shown beside the relevant fields using labels and accessible error associations.
The form marks invalid fields and React Hook Form focuses the first invalid input.
The submit action is disabled when checkout is unavailable or submission is in progress.
Use sample customer details because this is an educational demonstration.

### Genuine shadcn/ui components

Field, FieldLabel, FieldError and Label are adapted from genuine shadcn/ui source.
Their source references and MIT license are kept in src/shared/ui/shadcn.
They were adapted to named Props interfaces, separate files and the existing ROSEVEIL styling.
The project does not add a global Tailwind reset or replace the original visual theme.
These components structure the form; React Hook Form and Zod manage its data and validation.

### Confirmation and privacy

Schema validation can finish after the cart has changed.
Before confirming, CheckoutPage reads the latest adapter snapshot and checks checkout eligibility again.
Only a valid current order is captured and followed by clearing the shared bag and promo.
The confirmation retains only a nonpersonal item/totals summary in page memory.

Customer details stay in temporary form memory and are not sent, logged or saved to storage.
Leaving the form discards those values; refreshing does not preserve the confirmation.
No payment, real order, fulfillment, shipping request or email delivery occurs.

## Loading, errors and empty states

These states explain different situations and offer different next steps:

| State             | Meaning                                         | UI response                                   |
| ----------------- | ----------------------------------------------- | --------------------------------------------- |
| Lazy page loading | The page JavaScript is still loading.           | Suspense shows Loading page.                  |
| API loading       | A request for product data is still running.    | Catalog or detail loading feedback is shown.  |
| API error         | Product data could not be loaded or validated.  | An error message offers a real request retry. |
| Render error      | A component or lazy import failed to render.    | ErrorBoundary offers display recovery.        |
| Empty catalog     | The API successfully returned no products.      | Empty feedback offers Check Again.            |
| No matches        | Products exist, but current filters match none. | Resetting filters restores browsing.          |

Suspense wraps the page outlet to handle lazy page code.
Effect-based API requests use explicit loading and error state; Suspense does not manage those requests.
This distinction helps identify whether the user is waiting for page code or product data.

ErrorBoundary catches rendering and lazy-import failures, rather than ordinary API error results.
Header, footer, theme and bag remain outside page boundaries, so a failed page does not replace the shared shell.
Home and Shop also isolate collection rendering with a local boundary.
On Home, a catalog render failure leaves the Hero and editorial sections available.

Try Again remounts the failed display. For a rejected lazy import, LazyPage creates a fresh lazy instance.
Reusing the already rejected instance would immediately show the same failure again.
Retries happen only after user action, without an automatic retry loop.
A persistent source error or missing cached chunk may still need a refresh or corrected code.

## Development-only API scenarios

Start a dedicated development server:

```text
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

| Open directly                    | API request and behavior                                             |
| -------------------------------- | -------------------------------------------------------------------- |
| http://127.0.0.1:5175/delay/3000 | GET /api/delay/3000: loading for about three seconds, then products. |
| http://127.0.0.1:5175/fail/500   | GET /api/fail/500: HTTP 500; Try Again requests /api/products.       |
| http://127.0.0.1:5175/empty      | GET /api/empty: empty catalog; Check Again remains empty.            |

These literal API endpoints and matching page routes are development-only, disabled in preview/production.
Direct /api/fail/500 requests always return HTTP 500. Fully reload /shop to leave a selected scenario.
The student reported trying all three scenario pages successfully. Existing query-based development simulations remain separate.

## Design decisions and known limitations

The visual goal is to improve the original ROSEVEIL storefront while preserving its identity.
Original artwork, product images, section order and light/burgundy themes remain central.
The Hero keeps its four original product layers and replay behavior when returning to the section.
Home artwork is preloaded only on Home rather than on unrelated routes.

Cards use subtle hover and keyboard-focus feedback instead of continuous movement.
No alternate product photos are invented; secondary-image support has no live mappings until verified photos exist.
Reduced-motion preferences are respected and essential content stays available without animation.
Responsive layouts, labelled controls, visible focus and Escape dismissal remain part of the intended experience.

There are deliberate limits to this submission:

- Account, contact and policy dialogs remain unavailable with explanatory feedback.
- Parallax remains a future idea rather than an implemented feature.
- Newsletter feedback is local; there is no email subscription service.
- Checkout is local and does not connect to payment or order systems.
- Static hosting needs both an SPA fallback and working API handlers.
- No deployment has been performed.

The student reported successful routing, bag/checkout and development-scenario browser checks.
Those observations do not verify every browser, touch device or assistive technology.
Native dialog focus trapping, clipboard permissions, screen-reader announcements and mobile visual parity still need separate acceptance checks.
React/jsdom tests support behavior checks but cannot prove those browser-specific details.

## Validation and submission notes

```text
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
npm.cmd test
git diff --check
```

Latest verified application checks passed: typecheck, lint with zero warnings/errors, production build and all 107 tests across 21 files.
Formatting and whitespace checks passed again after this README update.
All nine protected Day 3 files were verified byte-identical to 731aaf7. Both required Vercel skills remain under .claude/skills/.

Project rules are in [AGENTS.md](AGENTS.md), design decisions in [VISION.md](VISION.md), the five Debug Lab exercises in [debug-lab-log.md](debug-lab-log.md), and my three personal answers in [answers.md](answers.md).
I reviewed and tried the Debug Lab fixes with Codex's help; Codex also ran automated React/jsdom tests. Chrome/React DevTools use for those exercises is not claimed.
Automated tests do not prove native focus trapping, clipboard permissions, screen-reader behavior or mobile visual parity; those need separate browser acceptance.
Account/contact/policy dialogs and parallax remain unavailable. Newsletter and checkout are local demos.
The local roseveil-submission-files.txt manifest stays ignored. No deployment or real commerce service is included.
