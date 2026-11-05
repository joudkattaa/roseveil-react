# ShopBoard Debug Lab Log

Codex performed all five official Debug Lab experiments using React and jsdom, reproduced the problems, and verified the fixes. I reviewed the explanations and solutions. I did not personally test the bugs in Chrome or React DevTools before submission. The observations below are from Codex's experiments, not my own browser testing.

## 1. Missing Key

**What I saw (Codex's test result):** React showed a warning about missing keys.

**Component:** `CategoryChips.tsx`

**How Codex found it:** Codex checked the React warning and looked at the category list code.

**Cause:** The categories were displayed using `map()` without a `key`.

**Fix:** Codex added `key={category}` because every category name is unique.

**Result:** The warning disappeared after the fix in Codex's test.

## 2. Unwanted Zero

**What I saw (Codex's test result):** Extra zeros appeared on sold-out products and in the empty cart.

**Components:** `StockNote.tsx` and `CartPanel.tsx`

**How Codex found it:** Codex checked the products with zero stock and the empty cart.

**Cause:** The code used `stock &&` and `cart.length &&`. React displayed `0` instead of hiding the content.

**Fix:** Codex changed the conditions to `stock > 0 &&` and `cart.length > 0 &&`.

**Result:** The extra zeros disappeared.

## 3. Wrong Key After Sorting

**What I saw (Codex's test result):** The saved heart moved from Leather Tote Bag to another product after sorting.

**Components:** `ProductList.tsx` and `ProductCard.tsx`

**How Codex found it:** Codex saved Leather Tote Bag, then sorted the products by price.

**Cause:** The code used `key={index}`, so React connected the saved state to the position instead of the product.

**Fix:** Codex changed it to `key={product.id}`.

**Result:** The heart stayed with Leather Tote Bag after sorting.

## 4. Array Mutation

**What I saw (Codex's test result):** After sorting by price and returning to Featured, the original product order did not come back.

**Component:** `ProductList.tsx`

**How Codex found it:** Codex compared the product order before sorting and after returning to Featured.

**Cause:** `products.sort()` changed the original array.

**Fix:** Codex used `[...products].sort()` to sort a copy.

**Result:** The original Featured order came back correctly.

## 5. State Mutation

**What I saw (Codex's test result):** The cart quantity did not update immediately when pressing the plus button.

**Components:** `CartRow.tsx`, `CartPanel.tsx`, and `App.tsx`

**How Codex found it:** Codex added Canvas Backpack to the cart and pressed the plus button twice. The quantity updated only after another action.

**Cause:** The code changed `item.qty` directly and reused the same cart array.

**Fix:** Codex used `setCart()` with `map()` to create a new array and update the item without changing the original state.

**Result:** The quantity and total updated immediately after the fix.

## What I Learned

From these bugs, I learned that React needs stable keys, clear boolean conditions, and immutable state updates. I also learned that sorting should not change the original array.

Codex tested the fixes using React and jsdom. I still need to check them personally in Chrome and React DevTools.

## Personal Note

I did not have enough time to test the five Debug Lab bugs myself before the submission deadline.

Codex tested the bugs using React and jsdom, and I reviewed their causes and solutions.

I still need to try the exercises myself in Chrome to understand them better. I plan to complete this part later if updates are allowed.
