interface ToastProps {
  message: string
  announcementId: number
}

export default function Toast({ message, announcementId }: ToastProps) {
  return (
    <p
      id="toast"
      className="toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message ? <span key={announcementId}>{message}</span> : null}
    </p>
  )
}
