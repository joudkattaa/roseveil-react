import type { NavigationItem } from '../../types/navigation.types.ts'

export const unavailableMessage =
  'Blog, Contact and account will be available in later migration stages.'
export const navigationItems: readonly NavigationItem[] = [
  { id: 'home', label: 'HOME', available: true, href: '/' },
  {
    id: 'shop',
    label: 'SHOP',
    available: true,
    href: '/shop',
    category: 'All',
  },
  {
    id: 'skin-care',
    label: 'SKIN CARE',
    available: true,
    href: '/shop',
    category: 'Skin Care',
  },
  {
    id: 'makeup',
    label: 'MAKEUP',
    available: true,
    href: '/shop',
    category: 'Makeup',
  },
  {
    id: 'hair-care',
    label: 'HAIR CARE',
    available: true,
    href: '/shop',
    category: 'Hair Care',
  },
  {
    id: 'body-care',
    label: 'BODY CARE',
    available: true,
    href: '/shop',
    category: 'Body Care',
  },
  {
    id: 'about',
    label: 'ABOUT US',
    available: true,
    href: '/about',
  },
  {
    id: 'journal',
    label: 'BLOG',
    available: false,
    reason: 'Journal not yet available.',
  },
  {
    id: 'contact',
    label: 'CONTACT US',
    available: false,
    reason: 'Contact form not yet available.',
  },
]
