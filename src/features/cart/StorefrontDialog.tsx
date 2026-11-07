import Dialog from '../../shared/ui/Dialog.tsx'
import ShoppingBag from './ShoppingBag.tsx'
import type {
  StorefrontAdapter,
  StorefrontSnapshot,
} from '../storefront/storefrontAdapter.ts'
import type { ActiveDialog } from './useShoppingBag.ts'

import CheckoutForm from '../checkout/CheckoutForm.tsx'
import DemoOrderConfirmation from '../checkout/DemoOrderConfirmation.tsx'
import { checkoutOrder } from '../checkout/checkout.logic.ts'

interface StorefrontDialogProps {
  beginCheckout: () => void
  backToBag: () => void
  confirmCheckout: () => void
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
  beginCheckout,
  backToBag,
  confirmCheckout,
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
          title={
            activeDialog.kind === 'bag'
              ? 'Your Shopping Bag'
              : activeDialog.kind === 'checkout'
                ? 'Demo Checkout'
                : activeDialog.kind === 'confirmation'
                  ? 'Demo Confirmation'
                  : 'Demo Confirmation'
          }
          onClose={() => {
            setActiveDialog(null)
            clearNotification()
          }}
        >
          {activeDialog.kind === 'bag' ? (
            <ShoppingBag
              onCheckout={() => {
                clearNotification()
                beginCheckout()
              }}
              focusOnMount={activeDialog.focusOnMount}
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
          ) : activeDialog.kind === 'checkout' ? (
            <CheckoutForm
              order={checkoutOrder(snapshot)}
              onBack={backToBag}
              onConfirm={confirmCheckout}
            />
          ) : activeDialog.kind === 'confirmation' ? (
            <DemoOrderConfirmation
              order={activeDialog.order}
              onContinue={continueShopping}
            />
          ) : null}
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
