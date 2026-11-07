import type { NavigationItem } from '../../types/navigation.types.ts'

export const unavailableMessage =
  'Blog, Contact and account will be available in later migration stages.'
export const navigationItems: readonly NavigationItem[] = [
  { id: 'home', label: 'HOME', available: true, href: '#top' },
  {
    id: 'shop',
    label: 'SHOP',
    available: true,
    href: '#products',
    category: 'All',
  },
  {
    id: 'skin-care',
    label: 'SKIN CARE',
    available: true,
    href: '#products',
    category: 'Skin Care',
  },
  {
    id: 'makeup',
    label: 'MAKEUP',
    available: true,
    href: '#products',
    category: 'Makeup',
  },
  {
    id: 'hair-care',
    label: 'HAIR CARE',
    available: true,
    href: '#products',
    category: 'Hair Care',
  },
  {
    id: 'body-care',
    label: 'BODY CARE',
    available: true,
    href: '#products',
    category: 'Body Care',
  },
  {
    id: 'about',
    label: 'ABOUT US',
    available: true,
    href: '#about',
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
