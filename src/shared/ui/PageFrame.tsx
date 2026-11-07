import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface PageFrameProps {
  title: string
  children: ReactNode
  width?: 'contained' | 'full'
}
export default function PageFrame({
  title,
  children,
  width = 'contained',
}: PageFrameProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = title + ' \u2014 ROSEVEIL Cosmetics'
    heading.current?.focus({ preventScroll: true })
  }, [title])
  return (
    <div className={width === 'full' ? 'route-page' : 'route-page container'}>
      <h1
        ref={heading}
        tabIndex={-1}
        className={width === 'full' ? 'container' : undefined}
      >
        {title}
      </h1>
      {children}
    </div>
  )
}
