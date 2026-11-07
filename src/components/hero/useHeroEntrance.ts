import { useEffect, useRef, useState } from 'react'

export function useHeroEntrance() {
  const artworkRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState<readonly string[]>([])
  const [failed, setFailed] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [entrance, setEntrance] = useState<'ready' | 'playing'>(() =>
    typeof IntersectionObserver === 'undefined' ? 'playing' : 'ready',
  )
  const active = loaded.length === 5 && !failed && !reduced
  function imageLoaded(id: string) {
    setLoaded((current) => (current.includes(id) ? current : [...current, id]))
  }
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function updatePreference() {
      setReduced(preference.matches)
    }
    updatePreference()
    preference.addEventListener('change', updatePreference)
    // Cached images can finish before React attaches load handlers.
    artworkRef.current
      ?.querySelectorAll<HTMLImageElement>('img[data-hero-asset]')
      .forEach((image) => {
        const id = image.dataset.heroAsset
        if (!id || !image.complete) return
        if (image.naturalWidth > 0) imageLoaded(id)
        else setFailed(true)
      })
    return () => preference.removeEventListener('change', updatePreference)
  }, [])
  useEffect(() => {
    if (!active) return
    const artwork = artworkRef.current
    const target = artwork?.closest('section.hero') ?? artwork
    if (!target) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== target) continue
          // Only a full exit resets playback. Threshold fluctuations while visible
          // never restart an entrance that is already playing or has settled.
          if (!entry.isIntersecting) setEntrance('ready')
          else if (entry.intersectionRatio >= 0.12) setEntrance('playing')
        }
      },
      { threshold: [0, 0.12] },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [active])
  return {
    artworkRef,
    active,
    entrance,
    imageLoaded,
    imageFailed: () => setFailed(true),
  }
}
