import Dialog from '../../shared/ui/Dialog.tsx'
import ShoppingBag from './ShoppingBag.tsx'
import type {
  StorefrontAdapter,
  StorefrontSnapshot,
} from '../storefront/storefrontAdapter.ts'
import type { ActiveDialog } from './useShoppingBag.ts'

interface StorefrontDialogProps {
  onCheckout: () => void
  activeDialog: ActiveDialog
  setActiveDialog: (value: ActiveDialog) => void
  snapshot: StorefrontSnapshot
  actions: StorefrontAdapter['actions']
  notification: { message: string; revision: number }
  changeQuantity: (id: string, delta: number) => void
  removeProduct: (id: string) => void
  clearBag: () => void
  clearNotification: () => void
  continueShopping: () => void
}

export default function StorefrontDialog({
  onCheckout,
  activeDialog,
  setActiveDialog,
  snapshot,
  actions,
  notification,
  changeQuantity,
  removeProduct,
  clearBag,
  clearNotification,
  continueShopping,
}: StorefrontDialogProps) {
  return (
    <>
      {activeDialog ? (
        <Dialog
          title="Your Shopping Bag"
          onClose={() => {
            setActiveDialog(null)
            clearNotification()
          }}
        >
          <ShoppingBag
            onCheckout={onCheckout}
            snapshot={snapshot}
            onQuantity={changeQuantity}
            onRemove={removeProduct}
            onClear={clearBag}
            onPromo={actions.setPromoCode}
            onContinue={continueShopping}
            onRetry={actions.loadCatalog}
          />
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
