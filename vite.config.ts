import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { productsMiddleware } from './server/products-api.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'roseveil-products-api',
      configureServer(server) {
        server.middlewares.use(productsMiddleware(true))
      },
      configurePreviewServer(server) {
        server.middlewares.use(productsMiddleware(false))
      },
    },
  ],
})
