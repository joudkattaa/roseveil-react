import Dialog from '../../shared/ui/Dialog.tsx'
import ShoppingBag from './ShoppingBag.tsx'
import ProductDetails from '../catalog/ProductDetails.tsx'
import type { Product } from '../../modules/products/products.types.ts'
import type {
  StorefrontAdapter,
  StorefrontSnapshot,
} from '../storefront/storefrontAdapter.ts'
import type { ActiveDialog } from './useShoppingBag.ts'

interface StorefrontDialogProps {
  activeDialog: ActiveDialog
  setActiveDialog: (value: ActiveDialog) => void
  selectedProduct: Readonly<Product> | undefined
  snapshot: StorefrontSnapshot
  actions: StorefrontAdapter['actions']
  notification: { message: string; revision: number }
  changeQuantity: (id: string, delta: number) => void
  removeProduct: (id: string) => void
  clearBag: () => void
  clearNotification: () => void
  addProduct: (id: string) => void
  continueShopping: () => void
}

export default function StorefrontDialog({
  activeDialog,
  setActiveDialog,
  selectedProduct,
  snapshot,
  actions,
  notification,
  changeQuantity,
  removeProduct,
  clearBag,
  clearNotification,
  addProduct,
  continueShopping,
}: StorefrontDialogProps) {
  return (
    <>
      {activeDialog ? (
        <Dialog
          title={
            activeDialog.kind === 'bag'
              ? 'Your Shopping Bag'
              : (selectedProduct?.name ?? 'Product unavailable')
          }
          onClose={() => {
            setActiveDialog(null)
            clearNotification()
          }}
        >
          {activeDialog.kind === 'bag' ? (
            <ShoppingBag
              snapshot={snapshot}
              onQuantity={changeQuantity}
              onRemove={removeProduct}
              onClear={clearBag}
              onPromo={(code) => {
                actions.setPromoCode(code)
              }}
              onContinue={continueShopping}
              onRetry={actions.loadCatalog}
            />
          ) : selectedProduct ? (
            <ProductDetails
              product={selectedProduct}
              available={snapshot.phase === 'ready'}
              onAdd={addProduct}
            />
          ) : (
            <p>Product unavailable. Please close and reload the collection.</p>
          )}
          <p role="status" aria-atomic="true">
            {notification.message ? (
              <span key={notification.revision}>{notification.message}</span>
            ) : null}
          </p>
        </Dialog>
      ) : null}
    </>
  )
}
