import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import HomeCatalogProvider from './features/catalog/HomeCatalogProvider.tsx'
import LazyPage from './shared/ui/LazyPage.tsx'
import RootLayout from './components/layout/RootLayout.tsx'

const loadHome = () => import('./pages/HomePage.tsx')
const HomePage = lazy(loadHome)
const loadShop = () => import('./pages/ShopPage.tsx')
const ShopPage = lazy(loadShop)
const loadProductDetails = () => import('./pages/ProductDetailsPage.tsx')
const ProductDetailsPage = lazy(loadProductDetails)
const loadAbout = () => import('./pages/AboutPage.tsx')
const AboutPage = lazy(loadAbout)
const loadBag = () => import('./pages/BagPage.tsx')
const BagPage = lazy(loadBag)
const loadCheckout = () => import('./pages/CheckoutPage.tsx')
const CheckoutPage = lazy(loadCheckout)
const loadNotFound = () => import('./pages/NotFoundPage.tsx')
const NotFoundPage = lazy(loadNotFound)

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
        <Route
          index
          element={<LazyPage key="Home" initial={HomePage} load={loadHome} />}
        />
        <Route
          path="shop"
          element={<LazyPage key="Shop" initial={ShopPage} load={loadShop} />}
        />
        <Route
          path="products/:id"
          element={
            <LazyPage
              key="ProductDetails"
              initial={ProductDetailsPage}
              load={loadProductDetails}
            />
          }
        />
        <Route
          path="products"
          element={
            <LazyPage
              key="ProductDetails"
              initial={ProductDetailsPage}
              load={loadProductDetails}
            />
          }
        />
        <Route
          path="about"
          element={
            <LazyPage key="About" initial={AboutPage} load={loadAbout} />
          }
        />
        <Route
          path="bag"
          element={<LazyPage key="Bag" initial={BagPage} load={loadBag} />}
        />
        <Route
          path="checkout"
          element={
            <LazyPage
              key="Checkout"
              initial={CheckoutPage}
              load={loadCheckout}
            />
          }
        />
        {import.meta.env.DEV ? (
          <>
            <Route
              path="delay/3000"
              element={
                <LazyPage key="Shop" initial={ShopPage} load={loadShop} />
              }
            />
            <Route
              path="fail/500"
              element={
                <LazyPage key="Shop" initial={ShopPage} load={loadShop} />
              }
            />
            <Route
              path="empty"
              element={
                <LazyPage key="Shop" initial={ShopPage} load={loadShop} />
              }
            />
          </>
        ) : null}
        <Route
          path="*"
          element={
            <LazyPage
              key="NotFound"
              initial={NotFoundPage}
              load={loadNotFound}
            />
          }
        />
      </Route>
    </Routes>
  )
}
