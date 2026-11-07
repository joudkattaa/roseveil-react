import type { Theme } from '../../modules/state/state.types.ts'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle"
      className="icon-button theme-toggle"
      type="button"
      aria-label="Dark mode"
      aria-pressed={theme === 'dark'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      <svg className="theme-moon" aria-hidden="true">
        <use href="#i-moon" />
      </svg>
      <svg className="theme-sun" aria-hidden="true">
        <use href="#i-sun" />
      </svg>
    </button>
  )
}
