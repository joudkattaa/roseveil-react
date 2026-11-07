import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Limit simultaneous jsdom storefronts on development machines.
    maxWorkers: 2,
    // Full storefront keyboard/form workflows can exceed five seconds in jsdom.
    testTimeout: 15_000,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
