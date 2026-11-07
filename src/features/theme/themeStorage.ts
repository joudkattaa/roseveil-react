import type { StorageAdapter } from '../../modules/state/state.types.ts'

// The protected store still owns persistence. Only its initial theme fallback changes.
export function createThemeStorage(): StorageAdapter {
  let storage: Storage | undefined
  try {
    storage = window.localStorage
  } catch {
    // Browsing restrictions may block storage; the store still works in memory.
  }
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
  return {
    getItem(key) {
      let value: string | null = null
      try {
        value = storage?.getItem(key) ?? null
      } catch {
        // Use the initial system preference if a saved theme cannot be read.
      }
      if (key === 'roseveil-theme') {
        return value === 'light' || value === 'dark' ? value : systemTheme
      }
      return value
    },
    setItem(key, value) {
      storage?.setItem(key, value)
    },
  }
}
