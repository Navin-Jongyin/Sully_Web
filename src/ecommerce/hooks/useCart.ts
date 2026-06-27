import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import { GUEST_CART_KEY } from '../constants';
import type { CartItem, Product } from '../types';
import { loadGuestCart, saveGuestCart } from '../lib/mergeGuestCart';

function cartDocId(item: Pick<CartItem, 'productId' | 'variantId'>) {
  return `${item.productId}_${item.variantId || 'default'}`;
}

export function useCart() {
  const { user } = useEcommerceAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) {
      const ref = collection(db, 'users', user.uid, 'cart');
      return onSnapshot(ref, (snap) => {
        setItems(
          snap.docs.map((d) => ({
            ...(d.data() as CartItem),
          })),
        );
      });
    }

    const syncGuest = () => setItems(loadGuestCart() as CartItem[]);
    syncGuest();
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY) syncGuest();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const addToCart = useCallback(
    async (product: Product, opts?: { variantId?: string | null; variantLabel?: string | null; quantity?: number }) => {
      const variantId = opts?.variantId ?? null;
      const variantLabel = opts?.variantLabel ?? null;
      const quantity = product.type === 'course' ? 1 : Math.max(1, opts?.quantity ?? 1);

      if (product.type === 'course' && items.some((i) => i.productId === product.id)) {
        throw new Error('This course is already in your cart.');
      }

      const item: CartItem = {
        productId: product.id,
        productType: product.type,
        title: product.title,
        price: product.price,
        quantity,
        imageURL: product.imageURL,
        variantId,
        variantLabel,
        addedAt: new Date().toISOString(),
      };

      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'cart', cartDocId(item)), {
          ...item,
          addedAt: serverTimestamp(),
        });
      } else {
        const guest = loadGuestCart();
        if (product.type === 'course' && guest.some((g) => g.productId === product.id)) {
          throw new Error('This course is already in your cart.');
        }
        guest.push(item);
        saveGuestCart(guest);
        setItems(guest as CartItem[]);
      }
    },
    [user, items],
  );

  const removeFromCart = useCallback(
    async (productId: string, variantId: string | null = null) => {
      const id = cartDocId({ productId, variantId });
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'cart', id));
      } else {
        const next = loadGuestCart().filter((i) => cartDocId(i) !== id);
        saveGuestCart(next);
        setItems(next as CartItem[]);
      }
    },
    [user],
  );

  const updateQuantity = useCallback(
    async (productId: string, variantId: string | null, quantity: number) => {
      const id = cartDocId({ productId, variantId });
      if (user) {
        await updateDoc(doc(db, 'users', user.uid, 'cart', id), { quantity: Math.max(1, quantity) });
      } else {
        const next = loadGuestCart().map((i) =>
          cartDocId(i) === id ? { ...i, quantity: Math.max(1, quantity) } : i,
        );
        saveGuestCart(next);
        setItems(next as CartItem[]);
      }
    },
    [user],
  );

  const clearCart = useCallback(async () => {
    if (user) {
      await Promise.all(items.map((i) => deleteDoc(doc(db, 'users', user.uid, 'cart', cartDocId(i)))));
    } else {
      saveGuestCart([]);
      setItems([]);
    }
  }, [user, items]);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount };
}
