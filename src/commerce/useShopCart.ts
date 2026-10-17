import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MerchandiseProduct } from './types';
import {
  addShopCartLine,
  buildCartDisplayLines,
  cartItemCount,
  cartSubtotal,
  clearShopCart,
  loadShopCart,
  saveShopCart,
  shopCartLineKey,
  type ShopCartLine,
} from './shop-cart';
import { availableStock } from './merchandise-utils';

export function useShopCart(merchandise: MerchandiseProduct[]) {
  const [items, setItems] = useState<ShopCartLine[]>(() => loadShopCart());

  useEffect(() => {
    const sync = () => setItems(loadShopCart());
    window.addEventListener('storage', sync);
    window.addEventListener('sully-shop-cart-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sully-shop-cart-updated', sync);
    };
  }, []);

  const displayLines = useMemo(
    () => buildCartDisplayLines(items, merchandise),
    [items, merchandise],
  );
  const totalThb = useMemo(() => cartSubtotal(displayLines), [displayLines]);
  const itemCount = useMemo(() => cartItemCount(items), [items]);

  const persist = useCallback((next: ShopCartLine[]) => {
    setItems(next);
    saveShopCart(next);
  }, []);

  const addToCart = useCallback((
    line: Omit<ShopCartLine, 'quantity'> & { quantity?: number },
    product: MerchandiseProduct,
  ) => {
    const maxQuantity = availableStock(product, line.colorOptionId);
    if (maxQuantity <= 0) throw new Error('This item is out of stock.');
    const quantity = line.quantity ?? 1;
    persist(addShopCartLine(items, { ...line, quantity }, maxQuantity));
  }, [items, persist]);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const line = displayLines.find((entry) => entry.key === key);
    if (!line) return;
    const nextQty = Math.max(1, Math.min(line.maxQuantity, Math.floor(quantity)));
    persist(items.map((entry) => (
      shopCartLineKey(entry) === key ? { ...entry, quantity: nextQty } : entry
    )));
  }, [displayLines, items, persist]);

  const removeFromCart = useCallback((key: string) => {
    persist(items.filter((entry) => shopCartLineKey(entry) !== key));
  }, [items, persist]);

  const emptyCart = useCallback(() => {
    setItems([]);
    clearShopCart();
  }, []);

  return {
    items,
    displayLines,
    totalThb,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    emptyCart,
  };
}
