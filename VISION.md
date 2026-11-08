# My Design Vision for ROSEVEIL

## My Idea

I wanted to make ROSEVEIL look like a modern and elegant cosmetics website. I liked my original design, so I didn't want to change it completely. I wanted to keep the same identity but make the website more attractive and interactive.

I chose soft pink, beige, rose gold, and burgundy because these colors match my brand. I also wanted to keep my original logo, fonts, product images, and the general layout.

My main idea was to make the website feel more luxurious, with smooth movements and small details that make the experience better.

## Homepage and Hero Section

I wanted to keep the original Hero design with the marble background, flowers, vase, and cosmetic products.

But instead of having everything appear at once, I wanted the four products to enter one by one with a smooth animation and stop in their original positions.

I used the original product images and background to keep the same design. The Hero animation also plays again when I scroll away from the section and return to it.

## Product Cards

I wanted the product cards to be more interactive without making the website too busy.

When someone moves the mouse over a product, the card moves up a little, the image zooms in smoothly, and a soft shadow appears. When the mouse leaves, the card returns to its original position.

I also wanted keyboard users to get similar feedback when focusing on a card.

I liked the idea of showing a second photo of the same product on hover. Since I don't have second photos yet, I kept the original product images. The image-switching feature is ready for when I add them.

## Other Animations

I wanted sections to appear smoothly while scrolling down the page.

I added gentle scroll effects and small shopping bag feedback animations. I decided not to use continuous floating animations for the product cards because I preferred a cleaner design.

I also thought about adding parallax effects, but I decided to leave that idea for later.

I wanted the animations to make the website feel elegant without becoming distracting or slowing it down.

## React Development

I rebuilt my original ROSEVEIL website using React and TypeScript while keeping the original product data and shopping logic.

I wanted the search, categories, sorting, shopping bag, and product details to work as they did in my original project.

I also turned the website into a multi-page React application using React Router.

The website now has separate pages for Home, Shop, Product Details, About, Shopping Bag, and Checkout, with shared navigation and a 404 page.

I wanted the shopping bag to stay the same across all pages and keep its products after refreshing the website.

I also wanted the website to work well on both mobile and desktop.

## What I Completed

I rebuilt the website using reusable React components and organized the code by feature.

I connected the product catalog to the API and implemented search, category filtering, sorting, and individual product pages.

I kept the shopping bag working across all pages using React Context. Users can add products, change quantities, remove items, and apply the GLOW20 discount.

I added a demo checkout using React Hook Form, Zod, and shadcn/ui to validate customer information. It is only a demonstration and does not process real payments or place real orders.

I kept the soft pink and beige light theme and the burgundy and rose-gold dark theme. I also added a theme button that saves the selected mode after refresh.

I added the four-product Hero entrance animation, subtle product card hover effects, scroll reveals, and shopping bag feedback.

I also added loading messages, error recovery, and empty states so the website remains understandable when product data is delayed, unavailable, or empty.

I kept the original design and product images instead of replacing them with a completely different style.

## My Goal

My goal was not to create a completely different website. I wanted to improve the ROSEVEIL project I had already made.

I wanted it to feel elegant, modern, and easy to use, with beautiful product images and smooth interactions.

I also wanted to keep the website accessible, including keyboard support, responsive layouts, and reduced-motion preferences.

For me, the most important thing was to keep my original design and make it better using React.