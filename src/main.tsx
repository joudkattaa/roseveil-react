import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import StorefrontProvider from './features/storefront/StorefrontProvider.tsx'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Cannot start ShopBoard: the root element #root is missing.')
}

createRoot(rootElement).render(
  <StrictMode>
    <StorefrontProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StorefrontProvider>
  </StrictMode>,
)
