import { useEffect } from 'react'
import type { Theme } from '../../modules/state/state.types.ts'

export function useTheme(theme: Theme, setTheme: (value: Theme) => void) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  return { toggleTheme }
}
