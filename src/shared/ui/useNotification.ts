import { useEffect, useState } from 'react'

export function useNotification() {
  const [notification, setNotification] = useState({ message: '', revision: 0 })

  useEffect(() => {
    if (!notification.message) return
    const timer = window.setTimeout(() => {
      setNotification((current) => ({ ...current, message: '' }))
    }, 3800)
    return () => window.clearTimeout(timer)
  }, [notification])

  async function copyCode() {
    let message: string
    try {
      await navigator.clipboard.writeText('GLOW20')
      message = 'GLOW20 copied! Apply it in your bag for 20% off.'
    } catch {
      message =
        'Could not copy GLOW20. Enter it manually in your bag for 20% off.'
    }
    setNotification((current) => ({ message, revision: current.revision + 1 }))
  }
  function notify(message: string) {
    setNotification((current) => ({ message, revision: current.revision + 1 }))
  }
  function clearNotification() {
    setNotification((current) => ({ ...current, message: '' }))
  }
  return { notification, notify, copyCode, clearNotification }
}
