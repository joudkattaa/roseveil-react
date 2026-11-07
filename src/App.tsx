import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import HomeCatalogProvider from './features/catalog/HomeCatalogProvider.tsx'
import RootLayout from './components/layout/RootLayout.tsx'

const HomePage = lazy(() => import('./pages/HomePage.tsx'))
const ShopPage = lazy(() => import('./pages/ShopPage.tsx'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage.tsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'))
const BagPage = lazy(() => import('./pages/BagPage.tsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.tsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'))

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <HomeCatalogProvider>
            <RootLayout />
          </HomeCatalogProvider>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="products" element={<ProductDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="bag" element={<BagPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
