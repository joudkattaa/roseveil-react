import HeroArtwork from './HeroArtwork.tsx'

interface HeroSectionProps {
  onExplore: () => void
}

export default function HeroSection({ onExplore }: HeroSectionProps) {
  return (
    <>
      <section className="hero hero-editorial" aria-labelledby="hero-title">
        <div className="hero-inner container">
          <div className="hero-copy">
            <p className="hero-kicker">YOUR DAILY DOSE OF ROSEVEIL</p>
            <h1 id="hero-title">
              A softer kind
              <br />
              of <em>radiance.</em>
            </h1>
            <p>
              A little rose. A little ritual. Discover beauty essentials that
              make the everyday feel extraordinary.
            </p>
            <a className="button" href="#products" onClick={onExplore}>
              SHOP NOW
            </a>
            <div className="hero-badges">
              <div>
                <svg aria-hidden="true">
                  <use href="#i-leaf" />
                </svg>
                <span>
                  BOTANICAL
                  <br />
                  INSPIRATION
                </span>
              </div>
              <div>
                <svg aria-hidden="true">
                  <use href="#i-rabbit" />
                </svg>
                <span>
                  THOUGHTFUL
                  <br />
                  BEAUTY
                </span>
              </div>
              <div>
                <svg aria-hidden="true">
                  <use href="#i-flask" />
                </svg>
                <span>
                  CONSIDERED
                  <br />
                  FORMULAS
                </span>
              </div>
            </div>
          </div>
        </div>
        <HeroArtwork accessibleLabel="Roseveil mauve tube, plum serum, cream jar and rose-gold pump on ivory marble with blush blossoms and a vase" />
      </section>
      <section className="benefits" aria-label="The Roseveil philosophy">
        <div className="benefits-inner container">
          <article>
            <svg aria-hidden="true">
              <use href="#i-leaf" />
            </svg>
            <div>
              <h2>Inspired by Nature</h2>
              <p>
                A little botanical beauty
                <br />
                in your daily ritual.
              </p>
            </div>
          </article>
          <article>
            <svg aria-hidden="true">
              <use href="#i-drop" />
            </svg>
            <div>
              <h2>Everyday Essentials</h2>
              <p>
                A considered collection
                <br />
                for moments of self-care.
              </p>
            </div>
          </article>
          <article>
            <svg aria-hidden="true">
              <use href="#i-diamond" />
            </svg>
            <div>
              <h2>A Touch of Luxury</h2>
              <p>
                Beautiful textures and
                <br />
                details to fall in love with.
              </p>
            </div>
          </article>
          <article>
            <svg aria-hidden="true">
              <use href="#i-gift" />
            </svg>
            <div>
              <h2>Made for Gifting</h2>
              <p>
                Little luxuries to share
                <br />
                with someone special.
              </p>
            </div>
          </article>
        </div>
      </section>
      <aside className="signature-ribbon" aria-label="The Roseveil signature">
        <svg aria-hidden="true">
          <use href="#i-flower" />
        </svg>
        <p>
          THE ROSEVEIL WAY <span>A softer moment, just for you.</span>
        </p>
        <svg aria-hidden="true">
          <use href="#i-flower" />
        </svg>
      </aside>
    </>
  )
}
