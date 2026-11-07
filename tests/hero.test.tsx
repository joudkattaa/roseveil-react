import { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import HeroArtwork from '../src/components/hero/HeroArtwork.tsx'

function preference(matches: boolean) {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => true,
  }
}
function loadScene() {
  const images = document.querySelectorAll('img[data-hero-asset]')
  expect(images).toHaveLength(5)
  images.forEach((image) => fireEvent.load(image))
}
function scene() {
  const node = document.querySelector('.hero-layered-scene')
  if (!node) throw new Error('Scene missing')
  return node
}

it('keeps the fallback until every real scene image has loaded', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference(false))
  render(<HeroArtwork accessibleLabel="Original ROSEVEIL artwork" />)
  expect(
    screen.getByRole('img', { name: 'Original ROSEVEIL artwork' }),
  ).toBeInTheDocument()
  expect(scene()).toHaveAttribute('hidden')
  const images = [...document.querySelectorAll('img[data-hero-asset]')]
  images.slice(0, 4).forEach((image) => fireEvent.load(image))
  expect(scene()).toHaveAttribute('hidden')
  const last = images[4]
  if (!last) throw new Error('Last layer missing')
  fireEvent.load(last)
  expect(scene()).not.toHaveAttribute('hidden')
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
  expect(document.querySelector('picture.hero-media')).toHaveAttribute('hidden')
  expect(document.querySelectorAll('.hero-product-layer')).toHaveLength(4)
  expect(document.querySelector('.hero-layer-tube img')).toHaveAttribute(
    'src',
    '/roseveil/hero-layer-classic-tube.webp',
  )
})

it('settles once and does not replay for ordinary React renders or duplicate load events', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference(false))
  const view = render(<HeroArtwork accessibleLabel="ROSEVEIL" />)
  loadScene()
  const pump = document.querySelector('.hero-layer-pump')
  if (!pump) throw new Error('Pump missing')
  fireEvent.animationEnd(pump)
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
  view.rerender(<HeroArtwork accessibleLabel="ROSEVEIL" />)
  loadScene()
  expect(scene()).not.toHaveAttribute('hidden')
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
})

it('preserves the unchanged flattened artwork if a layer fails', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference(false))
  render(<HeroArtwork accessibleLabel="ROSEVEIL" />)
  const layer = document.querySelector('.hero-layer-serum img')
  if (!layer) throw new Error('Serum missing')
  fireEvent.error(layer)
  loadScene()
  expect(scene()).toHaveAttribute('hidden')
  expect(document.querySelector('picture.hero-media')).not.toHaveAttribute(
    'hidden',
  )
  expect(document.querySelector('.hero-image')).toHaveAttribute(
    'src',
    '/roseveil/hero-ivory-classic.jpg',
  )
})

it('keeps static artwork for reduced motion and cleans its preference subscription', () => {
  const media = preference(true)
  vi.spyOn(window, 'matchMedia').mockReturnValue(media)
  const view = render(<HeroArtwork accessibleLabel="ROSEVEIL" />)
  loadScene()
  expect(scene()).toHaveAttribute('hidden')
  expect(scene()).not.toHaveAttribute('data-entrance')
  expect(document.querySelector('picture.hero-media')).not.toHaveAttribute(
    'hidden',
  )
  view.unmount()
  expect(media.removeEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function),
  )
})

it('starts with cached images under StrictMode without waiting for new load events', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference(false))
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
    1254,
  )
  render(
    <StrictMode>
      <HeroArtwork accessibleLabel="ROSEVEIL" />
    </StrictMode>,
  )
  expect(scene()).not.toHaveAttribute('hidden')
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
})

it('replays on each full Hero exit/return without restarting for visible threshold changes', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue(preference(false))
  const instances: IntersectionObserver[] = []
  let callback: IntersectionObserverCallback | undefined
  const disconnect = vi.fn()
  const observe = vi.fn()
  class Observer implements IntersectionObserver {
    root = null
    rootMargin = '0px'
    scrollMargin = '0px'
    thresholds = [0, 0.12]
    constructor(listener: IntersectionObserverCallback) {
      callback = listener
      instances.push(this)
    }
    observe = observe
    unobserve() {}
    disconnect = disconnect
    takeRecords() {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', Observer)
  const view = render(
    <section className="hero">
      <HeroArtwork accessibleLabel="ROSEVEIL" />
    </section>,
  )
  loadScene()
  const hero = document.querySelector('section.hero')
  const instance = instances[0]
  if (!hero || !instance || !callback) throw new Error('Hero observer missing')
  const notify = callback
  const entry = {
    target: hero,
    time: 0,
    rootBounds: null,
    boundingClientRect: hero.getBoundingClientRect(),
    intersectionRect: hero.getBoundingClientRect(),
  }
  expect(observe).toHaveBeenCalledWith(hero)
  expect(scene()).toHaveAttribute('data-entrance', 'ready')
  act(() =>
    notify(
      [{ ...entry, isIntersecting: true, intersectionRatio: 0.2 }],
      instance,
    ),
  )
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
  const pump = document.querySelector('.hero-layer-pump')
  if (!pump) throw new Error('Pump missing')
  fireEvent.animationEnd(pump)
  act(() =>
    notify(
      [{ ...entry, isIntersecting: true, intersectionRatio: 0.05 }],
      instance,
    ),
  )
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
  act(() =>
    notify(
      [{ ...entry, isIntersecting: true, intersectionRatio: 0.5 }],
      instance,
    ),
  )
  expect(scene()).toHaveAttribute('data-entrance', 'playing')
  for (let visit = 0; visit < 2; visit++) {
    act(() =>
      notify(
        [{ ...entry, isIntersecting: false, intersectionRatio: 0 }],
        instance,
      ),
    )
    expect(scene()).toHaveAttribute('data-entrance', 'ready')
    act(() =>
      notify(
        [{ ...entry, isIntersecting: true, intersectionRatio: 0.3 }],
        instance,
      ),
    )
    expect(scene()).toHaveAttribute('data-entrance', 'playing')
  }
  view.unmount()
  expect(disconnect).toHaveBeenCalledTimes(1)
})
