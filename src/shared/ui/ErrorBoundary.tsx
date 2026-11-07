import { Component, createRef } from 'react'
import type { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  label: string
  onRetry?: () => void
}
interface ErrorBoundaryState {
  failed: boolean
}
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false }
  private retryButton = createRef<HTMLButtonElement>()
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }
  componentDidCatch() {
    this.retryButton.current?.focus()
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="render-error container" role="alert">
        <h2>{this.props.label} could not be displayed</h2>
        <p>
          This is a display error. Your shopping bag is kept separately. Try
          again, or use the navigation to open another page.
        </p>
        <button
          ref={this.retryButton}
          className="button"
          type="button"
          onClick={() => {
            this.props.onRetry?.()
            this.setState({ failed: false })
          }}
        >
          Try Again
        </button>
      </section>
    )
  }
}
