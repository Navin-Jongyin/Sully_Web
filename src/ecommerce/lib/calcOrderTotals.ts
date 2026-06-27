import type { CartItem, Coupon, OrderTotals, Product } from '../types';
import { FLAT_SHIPPING_USD, TAX_RATE } from '../constants';

export function calcOrderTotals(
  items: CartItem[],
  coupon: Coupon | null,
  needsShipping: boolean,
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;

  if (coupon?.isActive) {
    if (coupon.type === 'percent') {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const shipping = needsShipping ? FLAT_SHIPPING_USD : 0;
  const total = taxable + tax + shipping;

  return { subtotal, discount, tax, shipping, total };
}

export function cartNeedsShipping(items: CartItem[], products: Record<string, Product>): boolean {
  return items.some((item) => {
    if (item.productType === 'merch') return true;
    const p = products[item.productId];
    return p?.shippingRequired === true;
  });
}
