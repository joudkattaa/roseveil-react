import { useNavigate } from 'react-router'
import PageFrame from '../shared/ui/PageFrame.tsx'
import ShoppingBag from '../features/cart/ShoppingBag.tsx'
import { useStorefront } from '../features/storefront/useStorefront.ts'
import { useStorefrontUi } from '../features/storefront/useStorefrontUi.ts'
export default function BagPage() {
  const { snapshot, actions } = useStorefront()
  const { bag } = useStorefrontUi()
  const navigate = useNavigate()
  return (
    <PageFrame title="Your Shopping Bag">
      <ShoppingBag
        snapshot={snapshot}
        onQuantity={bag.changeQuantity}
        onRemove={bag.removeProduct}
        onClear={bag.clearBag}
        onPromo={actions.setPromoCode}
        onContinue={() => navigate('/shop')}
        onRetry={actions.loadCatalog}
        onCheckout={() => navigate('/checkout')}
      />
    </PageFrame>
  )
}
