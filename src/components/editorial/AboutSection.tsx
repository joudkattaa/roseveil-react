import { useState } from 'react'

interface AboutSectionProps {
  storyId: string
}

export default function AboutSection({ storyId }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="about-inner container">
        <div className="about-copy">
          <p className="eyebrow">ABOUT ROSEVEIL</p>
          <h2 id="about-title">
            A Softer Way
            <br />
            to Bloom
          </h2>
          <p>
            We believe beauty begins with a moment for yourself. Discover an
            everyday ritual that brings together simple pleasures, thoughtful
            details, and a little natural inspiration.
          </p>
          <button
            className="button"
            id="about-more"
            onClick={() => setExpanded((current) => !current)}
            type="button"
            aria-expanded={expanded}
            aria-controls={storyId}
          >
            {expanded ? 'SHOW LESS' : 'LEARN MORE'}
          </button>
        </div>
        <div className="about-visual">
          <img
            src="/roseveil/gifts.webp"
            srcSet="
                /roseveil/gifts-240.webp  240w,
                /roseveil/gifts-480.webp  480w,
                /roseveil/gifts-800.webp  800w,
                /roseveil/gifts.webp     1254w
              "
            sizes="(min-width: 1000px) 450px, (min-width: 600px) 55vw, 100vw"
            decoding="async"
            alt="Roseveil rose wood gift box with face cream, serum and cleanser"
            loading="lazy"
            width="1254"
            height="1254"
          />
        </div>
        <div className="about-values">
          <article>
            <svg aria-hidden="true">
              <use href="#i-rabbit" />
            </svg>
            <div>
              <h3>A Softer Ritual</h3>
              <p>Take a little time for yourself.</p>
            </div>
          </article>
          <article>
            <svg aria-hidden="true">
              <use href="#i-leaf" />
            </svg>
            <div>
              <h3>Nature as Our Muse</h3>
              <p>Beauty in the simplest details.</p>
            </div>
          </article>
          <article>
            <svg aria-hidden="true">
              <use href="#i-flower" />
            </svg>
            <div>
              <h3>Your Kind of Glow</h3>
              <p>Discover what feels like you.</p>
            </div>
          </article>
        </div>
      </div>
      <div id={storyId} className="about-story container" hidden={!expanded}>
        <p>
          Roseveil is an illustrative beauty boutique created around soft
          colors, tactile textures, and the pleasure of a personal ritual.
          Explore skincare, makeup, fragrance, and gifts in one thoughtful
          collection. Product images and descriptions are concepts for this
          demonstration store.
        </p>
      </div>
    </section>
  )
}
