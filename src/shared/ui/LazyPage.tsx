import { lazy, useState } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { useLocation } from 'react-router'
import ErrorBoundary from './ErrorBoundary.tsx'

interface LazyPageProps {
  initial: LazyExoticComponent<ComponentType>
  load: () => Promise<{ default: ComponentType }>
}
export default function LazyPage({ initial, load }: LazyPageProps) {
  const [Page, setPage] = useState(() => initial)
  const { pathname } = useLocation()
  return (
    <ErrorBoundary
      key={pathname}
      label="This page"
      onRetry={() => setPage(() => lazy(load))}
    >
      <Page />
    </ErrorBoundary>
  )
}
