import type {
  MerchandiseProduct,
  MerchandisePurchaseLineItem,
  PurchaseRecord,
  PurchaseStatus,
} from './types';
import { displayImagesForSelection, normalizeMerchandise } from './merchandise-utils';

export function isMerchandisePurchase(record: PurchaseRecord): boolean {
  return record.productType === 'merchandise' || record.productType === 'merchandise_cart';
}

export function purchaseLineItems(record: PurchaseRecord): MerchandisePurchaseLineItem[] {
  if (Array.isArray(record.items) && record.items.length > 0) {
    return record.items.map((item) => ({
      merchandiseId: String(item.merchandiseId ?? ''),
      colorOptionId: item.colorOptionId,
      colorName: item.colorName,
      quantity: Math.max(1, Number(item.quantity) || 1),
      priceThb: Math.max(0, Number(item.priceThb) || 0),
      lineTotalThb: Math.max(0, Number(item.lineTotalThb) || 0),
      title: String(item.title ?? 'Item'),
      stripePriceId: item.stripePriceId,
      stripeProductId: item.stripeProductId,
    }));
  }

  if (record.merchandiseId) {
    return [{
      merchandiseId: record.merchandiseId,
      colorOptionId: record.colorOptionId,
      colorName: record.colorName,
      quantity: 1,
      priceThb: record.amountThb,
      lineTotalThb: record.amountThb,
      title: record.productTitle,
      stripePriceId: record.stripePriceId,
      stripeProductId: record.stripeProductId,
    }];
  }

  return [];
}

export function purchaseItemCount(record: PurchaseRecord): number {
  return purchaseLineItems(record).reduce((sum, item) => sum + item.quantity, 0);
}

export function purchaseSortTime(record: PurchaseRecord): number {
  const candidates = [record.paidAt, record.purchaseDate, record.createdAt];
  for (const value of candidates) {
    if (!value) continue;
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const seconds = Number((value as { seconds?: number }).seconds);
      if (Number.isFinite(seconds)) return seconds * 1000;
    }
  }
  return 0;
}

export function formatOrderDate(value: unknown): string {
  if (!value) return '—';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('th-TH');
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds?: number }).seconds);
    if (Number.isFinite(seconds)) {
      return new Date(seconds * 1000).toLocaleString('th-TH');
    }
  }
  return '—';
}

export function orderStatusLabel(status: PurchaseStatus): string {
  switch (status) {
    case 'paid': return 'Paid';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    default: return status;
  }
}

export const MERCHANDISE_ORDER_STATUSES: PurchaseStatus[] = [
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
];

export function lineImageUrl(
  line: MerchandisePurchaseLineItem,
  catalog: MerchandiseProduct[],
): string {
  const product = catalog.find((entry) => entry.id === line.merchandiseId);
  if (!product) return '';
  const normalized = normalizeMerchandise(product);
  const images = displayImagesForSelection(normalized, line.colorOptionId);
  return images[0] ?? normalized.imageUrl ?? '';
}

export function merchandiseOrderStats(orders: PurchaseRecord[]) {
  const paid = orders.filter((order) => order.status === 'paid');
  return {
    total: orders.length,
    paid: paid.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    revenueThb: paid.reduce((sum, order) => sum + (Number(order.amountThb) || 0), 0),
  };
}
