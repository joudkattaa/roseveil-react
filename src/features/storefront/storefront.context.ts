import { createContext } from 'react'
import type { StorefrontAdapter } from './storefrontAdapter.ts'

export const StorefrontContext = createContext<StorefrontAdapter | null>(null)
