import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Dialog({ title, onClose, children }: DialogProps) {
  const closing = useRef<Animation | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      closing.current?.cancel()
      closing.current = null
      dialog?.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])
  function requestClose() {
    if (closing.current) return
    const dialog = ref.current
    if (
      !dialog ||
      typeof dialog.animate !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      onClose()
      return
    }
    const animation = dialog.animate(
      [
        { opacity: 1, translate: '0 0' },
        { opacity: 0.8, translate: '0 6px' },
      ],
      { duration: 140, easing: 'ease-in', fill: 'forwards' },
    )
    closing.current = animation
    void animation.finished.then(
      () => {
        if (closing.current !== animation) return
        closing.current = null
        if (dialog.isConnected && dialog.open) onClose()
      },
      () => {
        if (closing.current === animation) closing.current = null
      },
    )
  }
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          type="button"
          aria-label="Close dialog"
          onClick={requestClose}
        >
          {String.fromCharCode(215)}
        </button>
      </div>
      {children}
    </dialog>
  )
}
