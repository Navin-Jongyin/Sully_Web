import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import type { CartItem, GuestCartItem } from '../types';
import { GUEST_CART_KEY } from '../constants';

export function loadGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export async function mergeGuestCartIntoFirestore(userId: string) {
  const guest = loadGuestCart();
  if (!guest.length) return;

  const cartRef = collection(db, 'users', userId, 'cart');
  const existing = await getDocs(cartRef);
  const existingCourseIds = new Set<string>();

  existing.docs.forEach((d) => {
    const data = d.data() as CartItem;
    if (data.productType === 'course') existingCourseIds.add(data.productId);
  });

  const batch = writeBatch(db);
  guest.forEach((item) => {
    if (item.productType === 'course' && existingCourseIds.has(item.productId)) return;
    const id = `${item.productId}_${item.variantId || 'default'}`;
    batch.set(doc(cartRef, id), {
      ...item,
      quantity: item.productType === 'course' ? 1 : item.quantity || 1,
      addedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  clearGuestCart();
}
