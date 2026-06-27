import { useCallback, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import type { Product, WishlistItem } from '../types';

export function useWishlist() {
  const { user } = useEcommerceAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const ref = collection(db, 'users', user.uid, 'wishlist');
    return onSnapshot(ref, (snap) => {
      setItems(snap.docs.map((d) => ({ productId: d.id, ...d.data() }) as WishlistItem));
    });
  }, [user]);

  const addToWishlist = useCallback(
    async (product: Product) => {
      if (!user) throw new Error('Sign in to save items to your wishlist.');
      await setDoc(doc(db, 'users', user.uid, 'wishlist', product.id), {
        productId: product.id,
        productType: product.type,
        title: product.title,
        price: product.price,
        imageURL: product.imageURL,
        addedAt: serverTimestamp(),
      });
    },
    [user],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', productId));
    },
    [user],
  );

  return { items, addToWishlist, removeFromWishlist };
}
