# ROSEVEIL project rules for Codex

## Scope and project references

- Work in this React repository only. The original `Desktop/shopboard` project is read-only.
- Follow the latest explicit user instruction. This file does not authorize new features, installations, Git changes or deployment.
- Read `README.md` for the actual component tree, prop contracts, state owners, setup and testing limits. Read `VISION.md` for the design vision.
- Preserve the original ROSEVEIL branding, images, layout, responsive behavior and light/burgundy styles. This is a migration, not a redesign.
- Keep `CLAUDE.md` and both required skills in `.claude/skills/`: `vercel-react-best-practices` and `vercel-composition-patterns`. Apply their relevant React guidance; skip Next.js-only guidance for this Vite app.

## React and TypeScript

- Use `.tsx` for components and `.ts` for hooks without JSX, types, adapters, API access and business logic.
- Keep at least six meaningful reusable TSX components. Put each reusable component in its own file with a named, explicit Props interface. App does not need an empty Props interface.
- Keep App focused on assembling the application. Group related components, hooks and UI logic by feature. Reuse existing working code before adding abstractions.
- Never use `any`, type assertions with `as`, or non-null assertions. Use `unknown`, runtime checks and existing category/sort guards instead.
- Use stable, unique keys from the data. Never use array indexes as keys.
- Never mutate props, React state or original arrays. Copy arrays before sorting and create new objects when updating data.
- Use explicit boolean conditions in JSX, such as `items.length > 0`, so numeric zero is not rendered by accident.
- Use React rendering, state and event handlers. Do not render UI with `innerHTML`, manual DOM nodes or document-wide event delegation.
- Keep shared state above its consumers and pass typed callbacks. Derive counts, filtered results and totals instead of storing duplicate state.
- Use refs and effects only when needed, such as native dialogs and focus handling. Clean up timers, listeners and subscriptions, including under StrictMode.
- Keep adapter snapshots cached, detached and immutable for `useSyncExternalStore`. Never expose the mutable legacy store to React. Avoid duplicate catalog requests.

## Protected Day 3 files

Keep these files byte-for-byte identical to commit `731aaf7`. Do not edit, move, format or automatically fix them, including their imports:

```text
src/logic.ts
src/state.ts
src/modules/cart/cart.logic.ts
src/modules/cart/cart.types.ts
src/modules/products/products.api.ts
src/modules/products/products.logic.ts
src/modules/products/products.types.ts
src/modules/state/state.types.ts
src/shared/api/client.ts
```

Build React integration around these files. Verify their bytes against the baseline after relevant work. Keep them excluded from Prettier and staged writers; lint may check them without changing them.

## Behavior and accessibility

- Preserve the validated `GET /api/products` API, original product IDs and data, cents-based prices, GLOW20, shipping rules, quantity limits and localStorage behavior.
- Preserve synchronized search, category filtering, sorting, featured products, product details and the shopping bag.
- Handle loading, error, retry, empty API results, no matches and success honestly. Preserve saved bag IDs when catalog prices are unavailable. Never present stale prices as current or allow invalid add actions.
- Keep unfinished actions disabled with accessible explanations. Checkout is a local demo requiring a nonempty bag and valid current totals. Keep customer details out of storage and network requests, and clear the bag only after valid demo confirmation. Do not claim payment, authentication, order fulfillment or email delivery works.
- Preserve semantic HTML, labels, visible focus, status feedback, keyboard/touch access, Escape dismissal and focus restoration. Avoid duplicate IDs and React console warnings.
- Preserve responsive layouts and reduced-motion support. Do not use `!important`. Add optional animations only when authorized; prefer transform/opacity and keep essential content visible without motion.

## Validation and instructor evidence

After code changes, run the existing checks from the repository root:

```text
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run format:check
npm.cmd test
```

- Lint must finish with zero warnings and errors. Use formatting checks for verification; `npm run format` writes files, so use it only within the authorized scope.
- Update tests for changed behavior and imports. Keep tests focused on real behavior, immutable snapshots, subscriptions, persistence and cleanup where relevant.
- Report actual results. React + jsdom tests do not prove native browser focus, clipboard permissions, visual parity or screen-reader behavior. Keep browser checks separate.
- Keep README component paths, exact Props contracts and state ownership aligned with source.
- Keep all five official Debug Lab bugs in `debug-lab-log.md` with observations, component, investigation, cause, fix and verification. Preserve honest AI attribution: Codex ran the React + jsdom experiments; do not claim the student ran Chrome or React DevTools experiments without evidence.
- Follow the instructor's rule: explain what changed, where and why after each task, with validation results and remaining limitations.

## Git and repository safety

- Review existing changes before editing. Preserve unrelated user work.
- Do not stage, commit, push, change remotes, deploy or upload without explicit authorization for the current task. Do not fetch or pull unless authorized.
- When commits are authorized, use small, meaningful groups and clear English messages. Include related moves, deletions and import updates so each commit works.
- Do not amend, squash, rebase, rewrite history or force-push without explicit approval.
- Use only the React repository's expected origin: `https://github.com/joudkattaa/roseveil-react.git`. Never change the original ShopBoard repository.
- Keep dependencies, build outputs, caches, backups, screenshots, prompts and obsolete planning files out of submission. Preserve required documentation and skills. Delete files or install packages only within explicit user authorization.
