import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COUPONS_COLLECTION } from '../constants';
import type { CartItem, Coupon } from '../types';

export async function validateCoupon(
  code: string,
  cartItems: CartItem[],
  subtotal: number,
): Promise<{ valid: true; coupon: Coupon } | { valid: false; reason: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, reason: 'Enter a coupon code.' };

  const snap = await getDoc(doc(db, COUPONS_COLLECTION, normalized));
  if (!snap.exists()) return { valid: false, reason: 'Coupon not found.' };

  const coupon = { code: normalized, ...snap.data() } as Coupon;
  if (!coupon.isActive) return { valid: false, reason: 'This coupon is no longer active.' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, reason: 'This coupon has expired.' };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: 'This coupon has reached its usage limit.' };
  }
  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    return { valid: false, reason: `Minimum order is $${coupon.minOrderAmount.toFixed(2)}.` };
  }
  if (coupon.appliesToProductIds?.length) {
    const eligible = cartItems.some((i) => coupon.appliesToProductIds!.includes(i.productId));
    if (!eligible) return { valid: false, reason: 'Coupon does not apply to items in your cart.' };
  }

  return { valid: true, coupon };
}
