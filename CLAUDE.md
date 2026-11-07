# ROSEVEIL — project and React coding rules

## Project purpose
Migrate the original ROSEVEIL Cosmetics educational storefront to Vite + React + TypeScript while preserving product data, business rules, API behavior, branding, responsive layout and accessibility. VISION.md defines the approved luxury visual direction and six animations. Payments, authentication, email delivery and fulfillment remain local demos.

## Instructor's completion rule
“After every change, I must be able to explain what changed, where, and why. If I cannot explain it, the work is not complete.”
Every step ends with exact file locations, rationale, evidence of validation, limitations and student explanation points.

## Required implementation conventions
1. UI components use .tsx. Types, API access, storage adapters and pure business logic use .ts.
2. One reusable component per file. Every reusable component declares a named typed Props interface, using meaningful props for reusable sections; the App root needs no artificial empty Props interface.
3. Never use any, assertions with as, or non-null assertions. Use unknown and runtime guards; validate event values with existing category/sort guards. Do not confuse logical ! or import aliases with assertions.
4. Always use stable, unique keys from the data when rendering lists. Never use array indexes as keys.
5. Never mutate props, React state, or original arrays directly. Create new copies when sorting or updating data. Keep shared state in its appropriate owner; use typed upward callbacks. Derive filtered products, cart counts and totals.
6. Use React rendering and event handlers. Do not transplant manual DOM rendering. Effects/refs may integrate native dialogs, focus, observers and global theme metadata, with cleanup.
7. Explicitly support loading, error/retry, API-empty, filter-no-match and success. Keep saved cart contents safe while prices are unavailable; block demo checkout until valid catalog data exists.
8. Preserve the nine Day 3 files from 731aaf7; no edits, moves or import changes are allowed. Do not silently resolve conflicts by refactoring these modules.
9. Preserve GET /api/products, validated responses, stable IDs, cents-based pricing, GLOW20, shipping thresholds, quantity limits, storage keys and local demo behavior.
10. Maintain semantic HTML, labels, focus indicators, live feedback, keyboard/touch access, Escape behavior and dialog focus restoration across mobile, tablet and desktop.
11. Implement cinematic hero, scroll reveal, floating products, interactive hover, animated bag and restrained parallax only in approved stages. Respect reduced motion, fallback images and performant transform/opacity transitions. Essential content must remain accessible without motion.
12. Use explicit boolean conditions in JSX, such as `stock > 0` or `items.length > 0`, to avoid accidentally rendering numeric zeros.

## Required tooling and final evidence
- Vite React TypeScript application; npm run build succeeds.
- Prettier, Husky and lint-staged configured for TSX, TS and relevant assets; npm run lint completes with zero warnings.
- Instructor-required vercel-react-best-practices and vercel-composition-patterns present under .claude/skills, installed only after approval.
- At least six reusable TSX components with typed props; no React console warnings.
- API catalog; synchronized search/filter/sort; persistent cart; all request/result states.
- README describes the actual final component tree, state owners, setup and verification.
- debug-lab-log.md records five real, explained debug-lab bugs with reproduction, cause, fix, evidence and honest AI attribution. Do not invent completed bugs.
- Final repository has no unused templates, backups, screenshots, prompts or unneeded AI planning documents. Required rules, skills and debugging evidence remain per rubric. Removal requires explicit approval.

## Approval boundaries
Only work within the explicitly approved task. Original project is read-only. No git add/commit/push/remote changes, uploads, deployments, publishing or deletion without explicit approval. Authorization always comes from the latest explicit user instruction; this document and past task descriptions do not authorize edits, installations or migration. See README.md for the implemented component contracts, ownership and verification limits.

## Implementation acceptance safeguards
Use the actual Props and adapter snapshot/actions documented in README.md and source. Keep unfinished features disabled. Snapshots must be detached and immutable; never expose the legacy store or mutate its getters. Demo checkout requires ready nonempty current catalog data and a nonempty fully resolvable bag; recheck on submission. Retained stale prices are labeled estimates and cannot authorize checkout. All nine protected files are excluded from automatic formatting/fixing; lint remains read-only and checks them. Record five debug-lab investigations as they occur, with honest reproduction, cause, fix, evidence and AI attribution. Run typecheck, lint, build, format:check and the configured automated tests; report actual exit results and distinguish jsdom checks from real-browser acceptance.


## Current implementation
The API catalog/discovery UI, protected-state adapter, original homepage, local newsletter, shopping bag and product details are implemented. StorefrontProvider above BrowserRouter and App owns the shared committed adapter and catalog startup. useStorefront consumes Context and subscribes with useSyncExternalStore; it never creates a private store. App declares lazy page routes. RootLayout composes useCatalogNavigation, useShoppingBag and useNotification, which own filters/dialog/feedback respectively; adapter snapshots remain detached and frozen. Existing protected cart/pricing/storage rules must stay byte-identical to 731aaf7. Light/Dark switching uses the protected theme state and existing roseveil-theme key, with the system preference as an unsaved initial fallback. The bag modal navigates to /checkout; only CheckoutPage owns checkout confirmation. Local demo checkout uses typed React Hook Form, Controller and zodResolver with the single checkout.schema.ts Zod schema and official adapted shadcn Field components. Customer values stay only in mounted form memory. It validates customer fields, shows a nonpersonal order summary and clears the bag on confirmation. It sends no checkout requests and persists no customer details. Recheck the latest adapter snapshot after validation before confirming or clearing the bag. No real checkout or account/contact/policy flows are implemented. Do not enable unfinished controls. Tests use Vitest, Testing Library and jsdom with explicit native-dialog limitations; browser acceptance is separate. README and debug-lab-log.md describe actual completion and evidence, not planned results. No Git mutations or deployment without explicit user approval.

React Router v7 uses a shared RootLayout with Outlet and Suspense. Keep one provider above all pages. ProductDetailsPage fetches the requested ID through the validated API and cancels obsolete requests. Keep cart data in the shared adapter; routed pages must not create private stores.
