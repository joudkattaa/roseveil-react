import type { Category } from '../../modules/products/products.types.ts'
import SearchField from '../../features/catalog/SearchField.tsx'
import { useEffect, useRef, useState } from 'react'
import type {
  NavigationId,
  NavigationItem,
} from '../../types/navigation.types.ts'
import MainNavigation from './MainNavigation.tsx'

import ThemeToggle from '../../features/theme/ThemeToggle.tsx'
import type { Theme } from '../../modules/state/state.types.ts'

interface SiteHeaderProps {
  theme: Theme
  onToggleTheme: () => void
  bagCount: number
  onOpenBag: () => void
  items: readonly NavigationItem[]
  activeId: NavigationId | undefined
  unavailableMessage: string
  query: string
  onQueryChange: (value: string) => void
  onSearchSubmit: () => void
  onCategoryChange: (value: Category | 'All') => void
  onHome: () => void
}

export default function SiteHeader({
  theme,
  onToggleTheme,
  bagCount,
  onOpenBag,
  items,
  activeId,
  unavailableMessage,
  query,
  onQueryChange,
  onSearchSubmit,
  onCategoryChange,
  onHome,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!searchOpen) return
    searchInputRef.current?.focus()
    function dismiss(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      setSearchOpen(false)
      searchToggleRef.current?.focus()
    }
    function outside(event: PointerEvent) {
      if (
        !(event.target instanceof Node) ||
        searchPanelRef.current?.contains(event.target) ||
        searchToggleRef.current?.contains(event.target)
      )
        return
      const restore = searchPanelRef.current?.contains(document.activeElement)
      setSearchOpen(false)
      if (restore) searchToggleRef.current?.focus()
    }
    window.addEventListener('keydown', dismiss)
    document.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('keydown', dismiss)
      document.removeEventListener('pointerdown', outside)
    }
  }, [searchOpen])
  const toggleRef = useRef<HTMLButtonElement>(null)
  const homeRef = useRef<HTMLAnchorElement>(null)
  const navigationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)')
    function handleBreakpoint(event: MediaQueryListEvent) {
      if (event.matches && document.activeElement === toggleRef.current)
        homeRef.current?.focus()
      if (
        !event.matches &&
        navigationRef.current?.contains(document.activeElement)
      )
        toggleRef.current?.focus()
      setMenuOpen(false)
    }
    desktop.addEventListener('change', handleBreakpoint)
    return () => desktop.removeEventListener('change', handleBreakpoint)
  }, [])

  useEffect(() => {
    if (!menuOpen || searchOpen) return
    function dismiss(event: KeyboardEvent) {
      if (
        event.key !== 'Escape' ||
        event.defaultPrevented ||
        window.matchMedia('(min-width: 1200px)').matches
      )
        return
      event.preventDefault()
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', dismiss)
    return () => window.removeEventListener('keydown', dismiss)
  }, [menuOpen, searchOpen])

  function closeMenu() {
    setMenuOpen(false)
    if (
      !window.matchMedia('(min-width: 1200px)').matches &&
      navigationRef.current?.contains(document.activeElement)
    )
      toggleRef.current?.focus()
  }

  return (
    <header className="site-header">
      <div className="header-inner container">
        <a
          ref={homeRef}
          className="logo"
          href="#top"
          aria-label="Roseveil Cosmetics home"
          onClick={() => {
            onHome()
            closeMenu()
          }}
        >
          <svg className="brand-flower" aria-hidden="true">
            <use href="#i-flower" />
          </svg>
          <span>
            ROSEVEIL<small>COSMETICS</small>
          </span>
        </a>
        <button
          ref={toggleRef}
          id="menu-toggle"
          className="icon-button menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg aria-hidden="true">
            <use href="#i-menu" />
          </svg>
        </button>
        <MainNavigation
          open={menuOpen}
          items={items}
          activeId={activeId}
          onNavigate={closeMenu}
          onHome={onHome}
          onCategoryChange={onCategoryChange}
          navigationRef={navigationRef}
        />
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={searchToggleRef}
            id="search-toggle"
            className="icon-button"
            type="button"
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-controls="search-panel"
            onClick={() => setSearchOpen((current) => !current)}
          >
            <svg aria-hidden="true">
              <use href="#i-search" />
            </svg>
          </button>
          <button
            id="account-button"
            className="icon-button"
            type="button"
            disabled
            aria-label="Demo account unavailable"
            aria-describedby="header-unavailable"
          >
            <svg aria-hidden="true">
              <use href="#i-user" />
            </svg>
          </button>
          <button
            id="cart-button"
            className="icon-button cart-button"
            type="button"
            onClick={onOpenBag}
            aria-haspopup="dialog"
            aria-label={`Open shopping bag, ${bagCount} items`}
          >
            <svg aria-hidden="true">
              <use href="#i-bag" />
            </svg>
            <span aria-hidden="true">{bagCount}</span>
          </button>
        </div>
      </div>
      <div
        ref={searchPanelRef}
        id="search-panel"
        className="search-panel container"
        hidden={!searchOpen}
      >
        <form
          id="search-form"
          role="search"
          aria-label="Search the collection"
          onSubmit={(event) => {
            event.preventDefault()
            setSearchOpen(false)
            onSearchSubmit()
          }}
        >
          <SearchField
            id="product-search"
            label="Find your everyday beauty essential"
            placeholder="Search serum, shampoo, perfume…"
            value={query}
            inputRef={searchInputRef}
            onChange={onQueryChange}
          >
            <button className="button" type="submit">
              SEARCH{' '}
              <svg className="icon" aria-hidden="true">
                <use href="#i-search" />
              </svg>
            </button>
          </SearchField>
        </form>
      </div>
      <p id="header-unavailable" className="sr-only">
        {unavailableMessage}
      </p>
    </header>
  )
}
