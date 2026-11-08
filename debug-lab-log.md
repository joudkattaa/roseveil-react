# ShopBoard Debug Lab Log

## Introduction

In this Debug Lab, I tested five common React bugs from the ShopBoard Debug Lab. I reproduced the problems, tried the fixes, and checked the results to understand why each bug happened and how to solve it.

I worked on the exercises myself and used Codex to help me understand the causes and improve the solutions. Codex also ran automated React/jsdom tests to verify the fixes.

The following sections explain what I observed, where I found each problem, what caused it, and how I fixed it.

## 1. Missing Key

**What I saw:** React showed a warning about missing keys in a list.

**Component:** `CategoryChips.tsx`

**How I found it:** I noticed the warning and checked the category list code. I used Codex to help me understand the problem.

**Cause:** The categories were displayed using `map()` without a `key`, so React could not identify each item correctly.

**Fix:** I added `key={category}` because each category name is unique.

**Result:** The warning disappeared after the fix.

## 2. Unwanted Zero

**What I saw:** Extra zeros appeared on sold-out products and in the empty shopping cart.

**Components:** `StockNote.tsx` and `CartPanel.tsx`

**How I found it:** I checked the conditions used to display stock information and cart content.

**Cause:** The code used `stock &&` and `cart.length &&`. When the values were zero, React displayed `0` on the page.

**Fix:** I changed the conditions to `stock > 0 &&` and `cart.length > 0 &&`.

**Result:** The extra zeros disappeared.

## 3. Wrong Key After Sorting

**What I saw:** The saved heart moved from Leather Tote Bag to another product after sorting.

**Components:** `ProductList.tsx` and `ProductCard.tsx`

**How I found it:** I saved Leather Tote Bag and sorted the products by price. When I noticed the heart moved, I checked the keys with help from Codex.

**Cause:** The code used `key={index}`, so React connected the saved state to the item's position instead of the product.

**Fix:** I changed it to `key={product.id}` because each product has a unique ID.

**Result:** The saved heart stayed with the correct product after sorting.

## 4. Array Mutation

**What I saw:** After sorting the products by price and returning to Featured, the products did not return to their original order.

**Component:** `ProductList.tsx`

**How I found it:** I compared the product order before sorting and after returning to Featured. I reviewed the sorting code with Codex.

**Cause:** The code used `products.sort()`, which changed the original array.

**Fix:** I used `[...products].sort()` to sort a copy without changing the original products.

**Result:** The original Featured order returned correctly.

## 5. State Mutation

**What I saw:** The shopping cart quantity did not update immediately when I pressed the plus button.

**Components:** `CartRow.tsx`, `CartPanel.tsx`, and `App.tsx`

**How I found it:** I added Canvas Backpack to the cart and pressed the plus button twice. The quantity did not update as expected, so I checked the state update code with Codex.

**Cause:** The code changed `item.qty` directly and reused the same cart array. React did not receive a new state reference.

**Fix:** With help from Codex, I used `setCart()` and `map()` to create a new array and update the correct item without changing the original state.

**Result:** The quantity and total updated immediately after the fix.
