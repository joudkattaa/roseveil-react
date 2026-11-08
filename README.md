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

The shared layout stays mounted while the selected page changes. Repeated names below are reused components.
Benefits and the ribbon are markup inside HeroSection, rather than separate components.

```text
StrictMode
+-- StorefrontProvider
    +-- BrowserRouter
        +-- App (Routes)
            +-- HomeCatalogProvider
                +-- RootLayout
                    +-- SiteLayout
                    |   +-- header slot
                    |   |   +-- AnnouncementBar
                    |   |   +-- SiteHeader
                    |   |       +-- MainNavigation
                    |   |       +-- SearchField
                    |   |       +-- ThemeToggle
                    |   +-- main: Suspense > Outlet > LazyPage > ErrorBoundary
                    |   |   +-- HomePage
                    |   |   |   +-- HeroSection > HeroArtwork
                    |   |   |   +-- CategorySection
                    |   |   |   +-- AboutSection
                    |   |   |   +-- ErrorBoundary > CatalogSection
                    |   |   |   +-- BeautyPromise
                    |   |   +-- ShopPage > PageFrame > ErrorBoundary > CatalogSection
                    |   |   +-- ProductDetailsPage > PageFrame > ProductDetails > ProductImage
                    |   |   +-- AboutPage > PageFrame > AboutSection, BeautyPromise
                    |   |   +-- BagPage > PageFrame > ShoppingBag
                    |   |   +-- CheckoutPage > PageFrame > CheckoutForm or DemoOrderConfirmation
                    |   |   +-- NotFoundPage > PageFrame
                    |   +-- footer slot: SiteFooter > NewsletterForm
                    +-- StorefrontDialog > Dialog > ShoppingBag (quick bag)
                    +-- Toast

CatalogSection > CatalogControls > SearchField
               > CatalogStatus
               > ProductGrid > ProductCard > ProductImage
ShoppingBag > CartRow > ProductImage; PromoForm
CheckoutForm > OrderSummary; Controller > Field > FieldLabel > Label
                                             > input / textarea; FieldError
DemoOrderConfirmation > OrderSummary
```

CheckoutPage shows empty-bag feedback when needed. The quick bag mounts only when opened.
Reusable components use named, typed Props interfaces in their own source files.

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

State stays near the components that need to change it.
SiteHeader owns whether its menu or search is open; AboutSection owns its expanded story.
NewsletterForm and CheckoutForm own their temporary form values.
The bag UI hook owns quick-dialog visibility and add feedback, while persistent cart data stays shared.
These choices keep unrelated UI details out of the shared store.

Home and Shop have different browsing needs, so their catalog filters are separate.
HomeCatalogProvider retains the Home featured/category choices across navigation.
RootLayout owns the Shop filters, which are also used by header search.
Neither filter owner stores another copy of the cart.

Counts, visible products, discounts and totals are calculated from current inputs.
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
