import { useEffect, useRef } from 'react'

export function useScrollReveal() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = root.current
    if (
      !element ||
      typeof IntersectionObserver === 'undefined' ||
      typeof element.animate !== 'function'
    )
      return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const seen = new Set<Element>()
    const animations = new Set<Animation>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            preference.matches ||
            !entry.isIntersecting ||
            seen.has(entry.target)
          )
            continue
          seen.add(entry.target)
          observer.unobserve(entry.target)
          if (
            !(entry.target instanceof HTMLElement) ||
            entry.target.contains(document.activeElement)
          )
            continue
          const animation = entry.target.animate(
            [
              { opacity: 0.85, translate: '0 8px' },
              { opacity: 1, translate: '0 0' },
            ],
            { duration: 500, easing: 'ease-out' },
          )
          animations.add(animation)
          void animation.finished.then(
            () => animations.delete(animation),
            () => animations.delete(animation),
          )
        }
      },
      { threshold: 0.08 },
    )
    function update() {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      animations.clear()
      if (preference.matches) return
      element
        ?.querySelectorAll('section:not(.hero), .signature-ribbon')
        .forEach((target) => {
          if (!seen.has(target)) observer.observe(target)
        })
    }
    update()
    preference.addEventListener('change', update)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      preference.removeEventListener('change', update)
    }
  }, [])
  return root
}
