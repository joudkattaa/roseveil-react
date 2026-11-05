import { useState } from 'react'

interface PromoFormProps {
  appliedCode: string
  onApply: (value: string) => void
}

export default function PromoForm({ appliedCode, onApply }: PromoFormProps) {
  const [value, setValue] = useState(appliedCode)
  const [error, setError] = useState('')
  return (
    <form
      className="promo-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (appliedCode) {
          onApply('')
          setValue('')
          setError('Discount removed.')
          return
        }
        const code = value.trim().toUpperCase()
        if (code !== 'GLOW20') {
          setError('That code is not available. Try GLOW20.')
          return
        }
        setError('')
        onApply(code)
      }}
    >
      <label htmlFor="promo-code">Have a little treat? Enter your code.</label>
      <div className="search-row">
        <input
          id="promo-code"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={20}
          autoComplete="off"
          placeholder="GLOW20"
        />
        <button className="button secondary" type="submit">
          {appliedCode ? 'REMOVE' : 'APPLY'}
        </button>
      </div>
      <p className="form-status" role="status">
        {error ||
          (appliedCode ? 'GLOW20 applied — enjoy 20% off your items.' : '')}
      </p>
    </form>
  )
}
