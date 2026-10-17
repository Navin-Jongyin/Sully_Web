import type { MerchandiseColorOption, MerchandiseProduct } from './types';

export function normalizeStockCount(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  return Math.max(0, Math.floor(Number(value) || 0));
}

function legacyInStock(value: unknown): boolean {
  return value !== false;
}

function colorFromLegacy(color: MerchandiseColorOption): MerchandiseColorOption {
  const stockCount = color.stockCount !== undefined && color.stockCount !== null
    ? normalizeStockCount(color.stockCount)
    : legacyInStock(color.inStock) ? 1 : 0;
  return {
    ...color,
    name: color.name.trim(),
    imageUrl: color.imageUrl?.trim() || undefined,
    stockCount,
    inStock: stockCount > 0,
  };
}

export function deriveProductInStock(
  stockCount: number,
  colors: MerchandiseColorOption[],
): boolean {
  if (colors.length > 0) return colors.some((color) => color.stockCount > 0);
  return stockCount > 0;
}

export function normalizeMerchandise(item: MerchandiseProduct): MerchandiseProduct {
  const fromArray = (item.imageUrls ?? []).map((url) => url.trim()).filter(Boolean);
  const legacy = item.imageUrl?.trim() ? [item.imageUrl.trim()] : [];
  const imageUrls = fromArray.length > 0 ? fromArray : legacy;
  const colors = (item.colors ?? [])
    .map(colorFromLegacy)
    .filter((color) => color.name.length > 0);
  const stockCount = item.stockCount !== undefined && item.stockCount !== null
    ? normalizeStockCount(item.stockCount)
    : colors.length > 0
      ? 0
      : legacyInStock(item.inStock) ? 1 : 0;

  return {
    ...item,
    imageUrls,
    imageUrl: imageUrls[0] ?? '',
    colors,
    stockCount,
    inStock: deriveProductInStock(stockCount, colors),
  };
}

export function resolveColorOption(
  item: MerchandiseProduct,
  colorOptionId?: string,
): MerchandiseColorOption | null {
  const product = normalizeMerchandise(item);
  if (!product.colors?.length) return null;
  if (!colorOptionId) return product.colors[0] ?? null;
  return product.colors.find((color) => color.id === colorOptionId) ?? null;
}

export function allMerchandiseGalleryImages(item: MerchandiseProduct): string[] {
  const product = normalizeMerchandise(item);
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (url?: string) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };
  for (const url of product.imageUrls ?? []) add(url);
  for (const color of product.colors ?? []) add(color.imageUrl);
  return urls;
}

export function galleryIndexForColorOption(
  item: MerchandiseProduct,
  colorOptionId?: string,
): number {
  const gallery = allMerchandiseGalleryImages(item);
  const color = resolveColorOption(normalizeMerchandise(item), colorOptionId);
  if (color?.imageUrl) {
    const index = gallery.indexOf(color.imageUrl);
    if (index >= 0) return index;
  }
  return 0;
}

export function colorOptionIdForGalleryImage(
  item: MerchandiseProduct,
  imageUrl: string,
): string | undefined {
  const product = normalizeMerchandise(item);
  const match = product.colors?.find((color) => color.imageUrl === imageUrl);
  if (!match || match.stockCount <= 0) return undefined;
  return match.id;
}

export function displayImagesForSelection(
  item: MerchandiseProduct,
  colorOptionId?: string,
): string[] {
  const product = normalizeMerchandise(item);
  const color = resolveColorOption(product, colorOptionId);
  if (color?.imageUrl) {
    return [color.imageUrl];
  }
  return [...(product.imageUrls ?? [])];
}

export function availableStock(
  item: MerchandiseProduct,
  colorOptionId?: string,
): number {
  const product = normalizeMerchandise(item);
  if (product.colors?.length) {
    const color = resolveColorOption(product, colorOptionId);
    return color?.stockCount ?? 0;
  }
  return product.stockCount ?? 0;
}

export function isMerchandisePurchasable(
  item: MerchandiseProduct,
  colorOptionId?: string,
): boolean {
  return availableStock(item, colorOptionId) > 0;
}

export function newColorOption(name = ''): MerchandiseColorOption {
  return {
    id: `color-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    stockCount: 0,
    inStock: false,
  };
}

/** Parse admin-entered THB price (allows commas and decimals). */
export function parsePriceThbInput(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export function formatPriceThbInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  return String(value);
}
