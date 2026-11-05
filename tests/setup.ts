import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  if (typeof localStorage !== 'undefined') localStorage.clear()
  vi.unstubAllGlobals()
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
  HTMLElement.prototype.scrollIntoView = vi.fn()
  // jsdom does not implement native modal behavior. Browser acceptance remains separate.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
    this.querySelector<HTMLElement>('button')?.focus()
  }
  HTMLDialogElement.prototype.close = function () {
    if (this.open) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
}
