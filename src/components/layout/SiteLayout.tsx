import type { ReactNode } from 'react'

import { useScrollReveal } from '../../shared/motion/useScrollReveal.ts'

interface SiteLayoutProps {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}

export default function SiteLayout({
  children,
  header,
  footer,
}: SiteLayoutProps) {
  const mainRef = useScrollReveal()
  return (
    <>
      <svg
        className="icon-library"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <symbol id="i-leaf" viewBox="0 0 32 32">
            <path d="M16 29V15M16 22C4 24 2 15 3 10c9-1 13 4 13 12ZM16 17C15 6 24 3 29 3c1 9-5 15-13 14Z" />
            <path d="m8 16 8 6 8-13" />
          </symbol>
          <symbol id="i-rabbit" viewBox="0 0 32 32">
            <path d="M12 15C5 1 12 0 15 13c2-15 9-13 5 1 8 2 8 13 0 15H10c-6-2-6-8-2-11M9 22l-3-1M19 19h.01M17 25h4" />
            <circle cx="27" cy="25" r="3" />
          </symbol>
          <symbol id="i-flask" viewBox="0 0 32 32">
            <path d="M12 3h8M14 3v9L5 28h22l-9-16V3M10 20h12M13 23h.01M19 25h.01" />
          </symbol>
          <symbol id="i-drop" viewBox="0 0 32 32">
            <path d="M16 2C14 9 5 16 5 21a11 11 0 0 0 22 0C27 16 18 9 16 2Z" />
            <path d="M10 21c0 4 3 6 6 6" />
          </symbol>
          <symbol id="i-diamond" viewBox="0 0 32 32">
            <path d="m2 11 6-7h16l6 7-14 19L2 11ZM2 11h28M8 4l8 26 8-26M11 11l5-7 5 7" />
          </symbol>
          <symbol id="i-gift" viewBox="0 0 32 32">
            <path d="M4 13h24v6H4zM6 19v11h20V19M16 13v17" />
            <path d="M16 13C0 11 6-1 12 5l4 8c14-1 13-13 6-8l-6 8Z" />
          </symbol>
          <symbol id="i-flower" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="4" />
            <path d="M12 11c-9-9 8-15 8 0 9-9 15 8 0 9 9 9-8 15-8 0-9 9-15-8 0-9Z" />
          </symbol>
          <symbol id="i-recycle" viewBox="0 0 32 32">
            <path d="m12 7 4-5 7 11M22 7l1 6-6-1M26 16l4 8-5 5H14M18 24l-4 5 4 3M9 27H3L1 21 9 8M3 10l6-2 2 6" />
          </symbol>
          <symbol id="i-menu" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </symbol>
          <symbol id="i-search" viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
          </symbol>
          <symbol id="i-user" viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="3.5" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2Z" />
          </symbol>
          <symbol id="i-bag" viewBox="0 0 24 24">
            <path d="M5 7h14l1 14H4L5 7Z" />
            <path d="M9 8V5a3 3 0 0 1 6 0v3" />
          </symbol>
          <symbol id="i-moon" viewBox="0 0 24 24">
            <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
          </symbol>
          <symbol id="i-sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </symbol>
          <symbol id="i-arrow" viewBox="0 0 24 24">
            <path d="M4 12h16m-5-5 5 5-5 5" />
          </symbol>
          <symbol id="i-mail" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="1" />
            <path d="m3 6 9 7 9-7" />
          </symbol>
          <symbol id="i-pin" viewBox="0 0 24 24">
            <path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z" />
            <circle cx="12" cy="9" r="2" />
          </symbol>
          <symbol id="i-filter" viewBox="0 0 24 24">
            <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />
          </symbol>
          <symbol id="i-sort" viewBox="0 0 24 24">
            <path d="M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4" />
          </symbol>
        </defs>
      </svg>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {header}
      <main ref={mainRef} id="main" tabIndex={-1}>
        {children}
      </main>
      {footer}
    </>
  )
}
