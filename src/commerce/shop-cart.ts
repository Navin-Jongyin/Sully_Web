import type { MerchandiseProduct } from './types';
import {
  availableStock,
  displayImagesForSelection,
  normalizeMerchandise,
  resolveColorOption,
} from './merchandise-utils';

export const SHOP_CART_STORAGE_KEY = 'sully_shop_cart_v1';

export interface ShopCartLine {
  merchandiseId: string;
  colorOptionId?: string;
  quantity: number;
}

export function shopCartLineKey(line: Pick<ShopCartLine, 'merchandiseId' | 'colorOptionId'>): string {
  return `${line.merchandiseId}:${line.colorOptionId ?? ''}`;
}

export function loadShopCart(): ShopCartLine[] {
  try {
    const raw = localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry): ShopCartLine | null => {
        if (!entry || typeof entry !== 'object') return null;
        const row = entry as Record<string, unknown>;
        const merchandiseId = String(row.merchandiseId ?? '').trim();
        const colorOptionId = String(row.colorOptionId ?? '').trim() || undefined;
        const quantity = Math.max(1, Math.min(99, Math.floor(Number(row.quantity) || 1)));
        if (!merchandiseId) return null;
        return { merchandiseId, colorOptionId, quantity };
      })
      .filter((entry): entry is ShopCartLine => entry !== null);
  } catch {
    return [];
  }
}

export function saveShopCart(items: ShopCartLine[]): void {
  localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('sully-shop-cart-updated'));
}

export function clearShopCart(): void {
  localStorage.removeItem(SHOP_CART_STORAGE_KEY);
  window.dispatchEvent(new Event('sully-shop-cart-updated'));
}

export interface ShopCartDisplayLine extends ShopCartLine {
  key: string;
  name: string;
  colorName?: string;
  imageUrl: string;
  priceThb: number;
  lineTotalThb: number;
  maxQuantity: number;
}

export function buildCartDisplayLines(
  items: ShopCartLine[],
  merchandise: MerchandiseProduct[],
): ShopCartDisplayLine[] {
  const byId = new Map(merchandise.map((item) => [item.id, normalizeMerchandise(item)]));

  return items.flatMap((item) => {
    const product = byId.get(item.merchandiseId);
    if (!product) return [];
    const color = resolveColorOption(product, item.colorOptionId);
    const maxQuantity = availableStock(product, item.colorOptionId);
    const quantity = Math.min(item.quantity, maxQuantity);
    if (quantity <= 0 || !product.stripePriceId) return [];
    const images = displayImagesForSelection(product, item.colorOptionId);
    return [{
      ...item,
      quantity,
      key: shopCartLineKey(item),
      name: product.name,
      colorName: color?.name,
      imageUrl: images[0] ?? product.imageUrl,
      priceThb: product.priceThb,
      lineTotalThb: product.priceThb * quantity,
      maxQuantity,
    }];
  });
}

export function cartSubtotal(lines: ShopCartDisplayLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalThb, 0);
}

export function cartItemCount(items: ShopCartLine[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addShopCartLine(
  items: ShopCartLine[],
  next: ShopCartLine,
  maxQuantity: number,
): ShopCartLine[] {
  const key = shopCartLineKey(next);
  const capped = Math.max(1, Math.min(maxQuantity, next.quantity));
  const existing = items.find((item) => shopCartLineKey(item) === key);
  if (existing) {
    return items.map((item) => (
      shopCartLineKey(item) === key
        ? { ...item, quantity: Math.min(maxQuantity, item.quantity + capped) }
        : item
    ));
  }
  return [...items, { ...next, quantity: capped }];
}
