import type { Category } from '../modules/products/products.types.ts'
export type NavigationId =
  | 'home'
  | 'shop'
  | 'skin-care'
  | 'makeup'
  | 'hair-care'
  | 'body-care'
  | 'about'
  | 'journal'
  | 'contact'

export type NavigationItem =
  | {
      readonly id: NavigationId
      readonly label: string
      readonly available: true
      readonly href: string
      readonly category?: Category | 'All'
    }
  | {
      readonly id: NavigationId
      readonly label: string
      readonly available: false
      readonly reason: string
    }
