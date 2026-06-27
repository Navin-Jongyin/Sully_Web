import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import { useCart } from '../hooks/useCart';
import { createEnrollmentsForOrder, createOrderClientSide } from '../hooks/useOrders';
import { calcOrderTotals } from '../lib/calcOrderTotals';
import { formatCurrency } from '../lib/formatCurrency';
import { validateCoupon } from '../lib/validateCoupon';
import type { Coupon, Order, ShippingAddress } from '../types';

const emptyAddress: ShippingAddress = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

export function CheckoutPage() {
  const { user } = useEcommerceAuth();
  const { items, clearCart, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const needsShipping = useMemo(() => {
    return items.some((i) => i.productType === 'merch');
  }, [items]);

  const totals = calcOrderTotals(items, coupon, needsShipping);

  async function applyCoupon() {
    setCouponError('');
    const result = await validateCoupon(couponCode, items, cartTotal);
    if (!result.valid) {
      setCouponError(result.reason);
      setCoupon(null);
      return;
    }
    setCoupon(result.coupon);
  }

  async function completeCheckout() {
    if (!user) return;
    setProcessing(true);
    try {
      // TODO: add payment provider SDK (Stripe recommended) — create PaymentIntent server-side
      const orderData: Omit<Order, 'orderId'> = {
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'placeholder',
        paymentIntentId: '',
        items: items.map((i) => ({
          productId: i.productId,
          productType: i.productType,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          imageURL: i.imageURL,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: coupon?.code ?? null,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        currency: 'usd',
        shippingAddress: needsShipping ? address : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: connect Cloud Function — replace client-side order write in production
      const id = await createOrderClientSide(user.uid, orderData);

      // TODO: connect Cloud Function — inventory decrement for merch
      await createEnrollmentsForOrder(user.uid, id, orderData.items);

      await clearCart();
      setOrderId(id);
      setStep(5);
    } finally {
      setProcessing(false);
    }
  }

  if (!items.length && !orderId) {
    return (
      <main className="container section shop-page">
        <p className="hint">Your cart is empty.</p>
        <Link to="/shop">Back to shop</Link>
      </main>
    );
  }

  return (
    <main className="container section shop-page checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-steps">
        {['Cart', 'Shipping', 'Coupon', 'Payment', 'Done'].map((label, i) => (
          <span key={label} className={step === i + 1 ? 'is-active' : step > i + 1 ? 'is-done' : ''}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <section>
          <h2>Review cart</h2>
          <ul className="cart-list">{items.map((i) => <li key={i.productId}>{i.title} × {i.quantity} — {formatCurrency(i.price * i.quantity)}</li>)}</ul>
          <p>Subtotal: {formatCurrency(cartTotal)}</p>
          <button type="button" className="button button-primary" onClick={() => setStep(needsShipping ? 2 : 3)}>
            Continue
          </button>
        </section>
      )}

      {step === 2 && needsShipping && (
        <section className="shop-form">
          <h2>Shipping address</h2>
          {(['fullName', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'] as const).map((field) => (
            <label key={field}>
              {field.replace(/([A-Z])/g, ' $1')}
              <input
                value={address[field]}
                onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                required={field !== 'addressLine2'}
              />
            </label>
          ))}
          <button type="button" className="button button-primary" onClick={() => setStep(3)}>Continue</button>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>Coupon code</h2>
          <div className="checkout-coupon">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" />
            <button type="button" className="button button-secondary" onClick={applyCoupon}>Apply</button>
          </div>
          {couponError && <p className="shop-error">{couponError}</p>}
          {coupon && <p className="hint">Coupon applied: {coupon.code}</p>}
          <p>Total after discount: {formatCurrency(totals.total)}</p>
          <button type="button" className="button button-primary" onClick={() => setStep(4)}>Continue to payment</button>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2>Payment</h2>
          <p className="hint">
            {/* TODO: add payment provider SDK — Stripe Payment Element goes here */}
            Payment integration placeholder. Connect Stripe before accepting live payments.
          </p>
          <p><strong>Order total: {formatCurrency(totals.total)}</strong></p>
          <button type="button" className="button button-primary" disabled={processing} onClick={completeCheckout}>
            {processing ? 'Processing…' : 'Complete order (dev placeholder)'}
          </button>
        </section>
      )}

      {step === 5 && orderId && (
        <section>
          <h2>Order confirmed</h2>
          <p>Thank you! Your order <strong>{orderId}</strong> has been placed.</p>
          <Link to="/account" className="button button-primary">Go to dashboard</Link>
        </section>
      )}
    </main>
  );
}
