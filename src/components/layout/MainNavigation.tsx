import { NavLink, useLocation } from 'react-router'
import type { Category } from '../../modules/products/products.types.ts'
import type { Ref } from 'react'
import type {
  NavigationId,
  NavigationItem,
} from '../../types/navigation.types.ts'

interface MainNavigationProps {
  open: boolean
  items: readonly NavigationItem[]
  activeId: NavigationId | undefined
  onNavigate: () => void
  onCategoryChange: (value: Category | 'All') => void
  onHome: () => void
  navigationRef: Ref<HTMLElement>
}

export default function MainNavigation({
  open,
  items,
  activeId,
  onNavigate,
  onCategoryChange,
  onHome,
  navigationRef,
}: MainNavigationProps) {
  const { pathname } = useLocation()
  return (
    <nav
      ref={navigationRef}
      id="main-nav"
      className={open ? 'main-nav is-open' : 'main-nav'}
      aria-label="Main navigation"
    >
      {items.map((item) =>
        item.available &&
        item.category &&
        item.category !== 'All' &&
        pathname === '/' ? (
          <button
            key={item.id}
            type="button"
            className={item.id === activeId ? 'active' : undefined}
            aria-pressed={item.id === activeId}
            onClick={() => {
              if (item.category) onCategoryChange(item.category)
              onNavigate()
            }}
          >
            {item.label}
          </button>
        ) : item.available ? (
          <NavLink
            key={item.id}
            to={item.href}
            end
            className={() => (item.id === activeId ? 'active' : undefined)}
            aria-current={item.id === activeId ? 'page' : false}
            onClick={() => {
              if (item.id === 'home') onHome()
              else if (item.category) onCategoryChange(item.category)
              onNavigate()
            }}
          >
            {item.label}
          </NavLink>
        ) : (
          <button
            key={item.id}
            type="button"
            disabled
            aria-describedby="header-unavailable"
            title={item.reason}
          >
            {item.label}
          </button>
        ),
      )}
    </nav>
  )
}
