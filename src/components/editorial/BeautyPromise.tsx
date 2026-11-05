interface BeautyPromiseProps {
  headingId: string
}

const promises = [
  { id: 'thoughtful-beauty', icon: 'rabbit', label: 'Thoughtful Beauty' },
  { id: 'nature-inspired', icon: 'leaf', label: 'Nature Inspired' },
  { id: 'everyday-rituals', icon: 'flower', label: 'Everyday Rituals' },
  { id: 'little-luxuries', icon: 'gift', label: 'Little Luxuries' },
  { id: 'less-is-more', icon: 'recycle', label: 'Less Is More' },
]

export default function BeautyPromise({ headingId }: BeautyPromiseProps) {
  return (
    <section className="promise" aria-labelledby={headingId}>
      <div className="container">
        <h2 id={headingId}>OUR BEAUTY PHILOSOPHY</h2>
        <div className="promise-grid">
          {promises.map((promise) => (
            <span key={promise.id}>
              <svg aria-hidden="true">
                <use href={`#i-${promise.icon}`} />
              </svg>
              {promise.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
