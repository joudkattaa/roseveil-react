import { useState } from 'react'
import type { FormEvent } from 'react'

interface NewsletterFormProps {
  confirmationMessage: string
}

export default function NewsletterForm({
  confirmationMessage,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmail('')
    setSubmitted(true)
  }

  return (
    <form
      id="newsletter"
      className="newsletter footer-newsletter"
      aria-labelledby="newsletter-title"
      onSubmit={submit}
    >
      <div className="footer-invitation-copy">
        <p className="eyebrow">LET YOUR EVERYDAY BLOOM</p>
        <h2 id="newsletter-title">
          A little beauty, <em>in your inbox.</em>
        </h2>
        <p>New rituals, thoughtful notes, and a little Roseveil inspiration.</p>
      </div>
      <div className="footer-signup">
        <label htmlFor="newsletter-email">Your email address</label>
        <div className="footer-signup-row">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            maxLength={254}
            aria-describedby="newsletter-demo"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setSubmitted(false)
            }}
          />
          <button className="button" type="submit">
            JOIN THE RITUAL{' '}
            <svg className="icon" aria-hidden="true">
              <use href="#i-arrow" />
            </svg>
          </button>
        </div>
        <p id="newsletter-demo" className="footer-signup-note">
          Demo signup only. Your email is not saved or sent.
        </p>
        <div className="newsletter-feedback">
          <span className="newsletter-feedback-reserve" aria-hidden="true">
            {confirmationMessage}
          </span>
          <p id="newsletter-status" role="status">
            {submitted ? confirmationMessage : ''}
          </p>
        </div>
      </div>
    </form>
  )
}
