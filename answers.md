1. Where does cart state live, and why?
   I use one shared cart instead of a separate cart for each page. The cart data lives in the shared store, and StorefrontProvider makes it available through React Context. This keeps the same products and quantities across all pages. The cart is also saved after refreshing the website.

2. Which effect did you keep, and why is it necessary?
   I kept useEffect in StorefrontProvider.tsx because it starts loading products from the API. The cleanup function releases the catalog when the Provider is no longer needed. The adapter can then cancel unnecessary requests safely.

3. Which components re-render when you click Add to Cart?
   I used React DevTools Profiler to check re-renders after clicking Add to Bag. In my recording, I saw RootLayout, SiteLayout, ShopPage, CatalogSection, and ProductGrid re-render.

When the cart data changes, React recalculates the affected components without refreshing the whole page. Some child components may also re-render because their parent renders.
