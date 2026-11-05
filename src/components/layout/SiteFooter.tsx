import NewsletterForm from '../forms/NewsletterForm.tsx'

interface SiteFooterProps {
  unavailableMessage: string
  onHome: () => void
  onShop: () => void
}

const policies = [
  { id: 'shipping', label: 'Shipping Policy' },
  { id: 'returns', label: 'Return Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'faq', label: 'FAQs' },
]

export default function SiteFooter({
  unavailableMessage,
  onHome,
  onShop,
}: SiteFooterProps) {
  return (
    <footer id="contact" className="site-footer footer-premium">
      <div className="footer-invitation container">
        <NewsletterForm confirmationMessage="A little glow, just for you. Demo signup complete — no email was saved or sent." />
      </div>
      <p id="footer-unavailable" className="sr-only">
        {unavailableMessage}
      </p>
      <div className="footer-grid container">
        <div className="footer-brand">
          <a className="logo" href="#top" onClick={onHome}>
            <svg className="brand-flower" aria-hidden="true">
              <use href="#i-flower" />
            </svg>
            <span>
              ROSEVEIL<small>COSMETICS</small>
            </span>
          </a>
          <p>
            Your everyday moment of beauty.
            <br />
            Thoughtfully inspired by nature.
          </p>
          <a className="footer-social" href="#newsletter">
            A little inspiration, in your inbox <span>↗</span>
          </a>
        </div>
        <div>
          <h2>EXPLORE ROSEVEIL</h2>
          <a href="#top" onClick={onHome}>
            Home
          </a>
          <a href="#products" onClick={onShop}>
            Shop
          </a>
          <a href="#about">About Us</a>
          <button type="button" disabled aria-describedby="footer-unavailable">
            Beauty Journal
          </button>
          <button type="button" disabled aria-describedby="footer-unavailable">
            Contact Us
          </button>
        </div>
        <div>
          <h2>CUSTOMER CARE</h2>
          {policies.map((policy) => (
            <button
              key={policy.id}
              type="button"
              disabled
              aria-describedby="footer-unavailable"
            >
              {policy.label}
            </button>
          ))}
        </div>
        <div className="footer-connect">
          <h2>LET'S CONNECT</h2>
          <button type="button" disabled aria-describedby="footer-unavailable">
            <svg className="icon" aria-hidden="true">
              <use href="#i-mail" />
            </svg>
            Write to Roseveil
          </button>
          <p>
            <svg className="icon" aria-hidden="true">
              <use href="#i-pin" />
            </svg>
            Beauty, wherever you are.
          </p>
          <p className="demo-note">
            Concept store · Demo shopping.
            <br />
            No real payments or deliveries.
          </p>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© 2026 Roseveil Cosmetics. Concept design.</span>
        <span>A little glow, every day.</span>
      </div>
    </footer>
  )
}
