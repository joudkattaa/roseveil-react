import { formatMoney } from '../../logic.ts'
import type { DemoOrder } from './checkout.logic.ts'

interface OrderSummaryProps {
  order: DemoOrder
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <section className="checkout-summary" aria-labelledby="order-summary-title">
      <h3 id="order-summary-title">Order summary</h3>
      <ul className="checkout-items">
        {order.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name}
              <small>
                Quantity: {item.quantity} at {formatMoney(item.price)} each
              </small>
            </span>
            <span>{formatMoney(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="checkout-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatMoney(order.totals.subtotal)}</dd>
        </div>
        <div>
          <dt>GLOW20 discount</dt>
          <dd>{formatMoney(order.totals.discount)}</dd>
        </div>
        <div>
          <dt>Demo shipping</dt>
          <dd>{formatMoney(order.totals.shipping)}</dd>
        </div>
        <div className="grand-total">
          <dt>Final total</dt>
          <dd>{formatMoney(order.totals.total)}</dd>
        </div>
      </dl>
    </section>
  )
}
