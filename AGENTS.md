# ROSEVEIL Project Rules for Codex

## Scope and Project References

- Work in this React repository only. My original `Desktop/shopboard` project is read-only.
- Follow my latest explicit instruction. This file does not give permission to add new features, install packages, change Git history, or deploy.
- Read `README.md` for the component tree, state ownership, setup, and testing instructions. Read the component source files for exact Props interfaces.
- Read `VISION.md` to understand my original design ideas.
- Keep the original ROSEVEIL branding, images, layout, responsive behavior, and light/burgundy themes. I want to improve my original design, not replace it.
- Keep `AGENTS.md` as the only project rules file for Codex.
- Preserve the two required skills in `.claude/skills/`: `vercel-react-best-practices` and `vercel-composition-patterns`. Apply their relevant React guidance, but skip Next.js-only advice because this is a Vite application.

## Lessons I Learned

While developing ROSEVEIL, I learned that having a working website is not enough. I also need to understand my code, keep it organized, and test changes before accepting them.

These are the main lessons I want Codex to follow in my project:

- **Keep my original work safe.** When I moved from JavaScript to TypeScript and then React, I learned how important it is to preserve my original files. I want Codex to build around my protected Day 3 code instead of changing it.

- **Use one place for shared state.** I learned that the shopping bag should have one source of truth. This helps keep the same products and quantities across all pages.

- **Be careful with API requests and effects.** I learned that requests can finish after a component changes or unmounts. Codex should clean up unnecessary requests and avoid showing cancellation as an error.

- **Keep components small and understandable.** I learned that large components are harder to read and explain. I want related code grouped by feature, with clear names and simple responsibilities.

- **Avoid TypeScript shortcuts.** I learned that using `any` can hide mistakes. I want clear types and proper validation instead of bypassing TypeScript errors.

- **Protect the user experience.** I learned that loading, error, and empty states are important. The website should explain what is happening and allow users to retry when possible.

- **Check accessibility and animations.** I learned that keyboard navigation, visible focus, and reduced-motion support matter. I want animations to improve the design without making the website difficult to use.

- **Test changes before accepting them.** I learned that passing automated tests does not automatically prove everything works in a real browser. I want Codex to report what was tested and what still needs manual checking.

- **Keep the repository clean.** I learned that backups, unused files, generated outputs, and unnecessary assets should not be included in my submission.

- **Understand every change.** I learned that it is important to understand the changes made to my project, not just accept them because they work. I want Codex to explain what changed, where, and why in simple English so I can review the code before committing it.

These lessons are the reason behind the technical rules in this file.

## React and TypeScript

- Use `.tsx` for components and `.ts` for hooks without JSX, types, adapters, API access, and business logic.
- Keep at least six meaningful reusable TSX components. Put each reusable component in its own file with a named, explicit Props interface. `App` does not need an empty Props interface.
- Keep `App` focused on assembling the application. Group related components, hooks, and UI logic by feature. Reuse existing working code before adding abstractions.
- Never use `any`, type assertions with `as`, or non-null assertions. Use `unknown`, runtime checks, and existing category/sort guards instead.
- Use stable, unique keys from the data. Never use array indexes as keys.
- Never mutate props, React state, or original arrays. Copy arrays before sorting and create new objects when updating data.
- Use explicit boolean conditions in JSX, such as `items.length > 0`, so numeric zero is not rendered by accident.
- Use React rendering, state, and event handlers. Do not render UI with `innerHTML`, manual DOM nodes, or document-wide event delegation.
- Keep shared state above its consumers and pass typed callbacks. Derive counts, filtered results, and totals instead of storing duplicate state.
- Use refs and effects only when needed, such as for native dialogs and focus handling. Clean up timers, listeners, and subscriptions, including under StrictMode.
- Keep one stable `StorefrontProvider` above `BrowserRouter` and all pages. `useStorefront` consumes Context and `useSyncExternalStore`; it must not create private stores or start duplicate requests.
- Keep adapter snapshots cached, detached, and immutable. Never expose the mutable legacy store to React.
- Only the provider owns shared catalog cancellation. A page unsubscribe must not cancel another consumer's request.
- Abort obsolete product-detail requests and clean up safely under StrictMode. Do not display intentional cancellation as an API error.
- Keep shared Header, Footer, theme, and bag outside page Error Boundaries.
- Use Suspense for lazy page code and explicit API state for request loading and errors.
- Keep render errors separate from API errors. Try Again must perform a real retry without automatic retry loops. Lazy retries must not reuse a rejected lazy instance.

## Protected Day 3 Files

Keep these files byte-for-byte identical to commit `731aaf7`. Do not edit, move, format, or automatically fix them, including their imports:

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

Build React integration around these files.

Verify their bytes against the baseline after relevant work.

Keep them excluded from Prettier and staged writers. Lint may check them without changing them.

## Behavior and Accessibility

- Preserve the validated `GET /api/products` API, original product IDs and data, cents-based prices, GLOW20, shipping rules, quantity limits, and localStorage behavior.
- Preserve synchronized search, category filtering, sorting, featured products, product details, and the shopping bag.
- Handle loading, error, retry, empty API results, no matches, and success honestly.
- Preserve saved bag IDs when catalog prices are unavailable. Never present stale prices as current or allow invalid add actions.
- Keep unfinished actions disabled with accessible explanations.
- Checkout is a local demo requiring a nonempty bag and valid current totals.
- Keep customer details out of storage and network requests, and clear the bag only after valid demo confirmation.
- Do not claim payment, authentication, order fulfillment, or email delivery works.
- Keep the bag popup for quick access, but navigate to `/checkout` for the single checkout and confirmation flow.
- Use typed React Hook Form, `Controller`, `zodResolver`, and one Zod schema.
- Preserve the genuine shadcn `Field` source, license, and provenance. Do not replace it with custom lookalikes.
- Recheck the latest adapter snapshot after async validation before confirming or clearing the bag.
- Customer data stays only in temporary form memory.
- Preserve semantic HTML, labels, visible focus, status feedback, keyboard and touch access, Escape dismissal, and focus restoration.
- Avoid duplicate IDs and React console warnings.
- Preserve responsive layouts and reduced-motion support.
- Do not use `!important`.
- Add optional animations only when I authorize them. Prefer transform and opacity, and keep essential content visible without motion.
- Keep the literal `/api/delay/3000`, `/api/fail/500`, and `/api/empty` scenarios development-only.
- Do not silently replace them with query parameters or enable them in production.
- The fail scenario retries the normal API; direct fail endpoint requests still return HTTP 500.
- Preserve the approved four-layer Hero entrance and viewport replay.
- Keep product cards still except for subtle hover and keyboard-focus feedback.
- Only use verified secondary photos of the same product.
- Preload Home-only artwork only on Home, with matching image sizes, source sets, and MIME type. Do not globally preload the Hero.

## Validation and Instructor Evidence

After code changes, run the existing checks from the repository root:

```text
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run format:check
npm.cmd test
```

- Lint must finish with zero warnings and errors.
- Use formatting checks for verification. `npm run format` writes files, so use it only within the authorized scope.
- Update tests for changed behavior and imports.
- Keep tests focused on real behavior, immutable snapshots, subscriptions, persistence, and cleanup where relevant.
- Report actual results. React and jsdom tests do not prove native browser focus, clipboard permissions, visual parity, or screen-reader behavior. Keep browser checks separate.
- Keep README component paths and state ownership aligned with the source. Keep exact Props interfaces documented in the component source files.
- Keep all five official Debug Lab bugs in `debug-lab-log.md` with observations, component, investigation, cause, fix, and verification.
- **Preserve honest AI attribution.** Explain which Debug Lab steps I tested myself and where Codex helped me find solutions. Only report browser or React DevTools checks that were actually performed.
- `answers.md` must be written personally by me. Do not generate it or invent personal experiments.
- Follow my instructor's rule: explain what changed, where, and why after each task, with validation results and remaining limitations.

## Git and Repository Safety

- Review existing changes before editing. Preserve unrelated work.
- Do not stage, commit, push, change remotes, deploy, or upload without my explicit authorization for the current task.
- Do not fetch or pull unless I authorize it.
- When I authorize commits, use small, meaningful groups and clear English messages.
- Include related moves, deletions, and import updates so each commit works.
- Do not amend, squash, rebase, rewrite history, or force-push without my explicit approval.
- Use only this React repository's expected origin: `https://github.com/joudkattaa/roseveil-react.git`.
- Never change my original ShopBoard repository.
- Keep unnecessary dependencies, build outputs, caches, backups, screenshots, prompts, and obsolete planning files out of submission.
- Preserve required documentation and skills.
- Delete files or install packages only within my explicit authorization.