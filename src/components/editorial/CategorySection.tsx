import type { Category } from '../../modules/products/products.types.ts'

interface CategorySectionProps {
  category: Category | 'All' | null
  onSelect: (category: Category) => void
}
interface CategoryTile {
  readonly id: Category
  readonly image: string
  readonly alt: string
}

const categories: readonly CategoryTile[] = [
  { id: 'Skin Care', image: 'serum', alt: 'Rose gold skincare serum' },
  {
    id: 'Makeup',
    image: 'makeup',
    alt: 'Warm neutral eyeshadow palette and makeup essentials',
  },
  {
    id: 'Hair Care',
    image: 'hair',
    alt: 'Mauve and plum bottles of shampoo and hair oil',
  },
  {
    id: 'Fragrance',
    image: 'perfume',
    alt: 'Rose Bloom perfume in a glass bottle',
  },
  {
    id: 'Body Care',
    image: 'body-lotion',
    alt: 'Pale blush body lotion bottle with rose gold pump',
  },
  { id: 'Face Masks', image: 'masks', alt: 'Botanical face mask sachets' },
  { id: 'Gift Sets', image: 'gifts', alt: 'Blush pink skincare gift box' },
]

export default function CategorySection({
  category: activeCategory,
  onSelect,
}: CategorySectionProps) {
  return (
    <section
      id="categories"
      className="categories container"
      aria-labelledby="categories-title"
    >
      <p className="eyebrow">SHOP BY CATEGORY</p>
      <h2 id="categories-title">Find Your Everyday Ritual</h2>
      <p className="section-note">
        A little rose. A little ritual. Entirely you.
      </p>
      <div className="category-grid">
        {categories.map((category) => (
          <a
            href="#products"
            onClick={() => onSelect(category.id)}
            aria-current={activeCategory === category.id ? 'true' : undefined}
            key={category.id}
            className="category-card"
            data-category={category.id}
          >
            <img
              src={`/roseveil/${category.image}.webp`}
              srcSet={`/roseveil/${category.image}-240.webp 240w, /roseveil/${category.image}-480.webp 480w, /roseveil/${category.image}-800.webp 800w, /roseveil/${category.image}.webp 1254w`}
              sizes="(min-width: 1200px) 180px, (min-width: 900px) 25vw, (min-width: 600px) 34vw, 50vw"
              decoding="async"
              alt={category.alt}
              loading="lazy"
              width={600}
              height={600}
            />
            <h3>{category.id}</h3>
            <span>
              Shop now{' '}
              <svg className="icon" aria-hidden="true">
                <use href="#i-arrow" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
