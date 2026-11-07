import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import StorefrontProvider from '../src/features/storefront/StorefrontProvider.tsx'

interface TestRootProps {
  children: ReactNode
}
interface StorefrontRenderOptions {
  initialEntries?: string[]
}
export function renderStorefront(
  ui: ReactNode,
  { initialEntries = ['/'] }: StorefrontRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }: TestRootProps) => (
      <StorefrontProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </StorefrontProvider>
    ),
    reactStrictMode: true,
  })
}
