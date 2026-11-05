interface AnnouncementBarProps {
  onCopyCode: () => Promise<void>
}

export default function AnnouncementBar({ onCopyCode }: AnnouncementBarProps) {
  return (
    <div className="announcement">
      FREE SHIPPING ON ORDERS OVER $50 <span aria-hidden="true">|</span> USE
      CODE:{' '}
      <button
        id="copy-code"
        type="button"
        aria-label="Copy discount code GLOW20"
        onClick={() => {
          void onCopyCode()
        }}
      >
        GLOW20
      </button>
    </div>
  )
}
