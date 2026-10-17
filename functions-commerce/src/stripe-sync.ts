import { FieldValue, type DocumentData } from 'firebase-admin/firestore';
import type Stripe from 'stripe';
import {
  isConfiguredStripePrice,
  isConfiguredStripeProduct,
  thbToStripeUnitAmount,
} from './payment-utils.js';

export function merchandiseSyncHash(data: DocumentData): string {
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.map((url) => String(url ?? '').trim()).filter(Boolean)
    : [];
  const colors = Array.isArray(data.colors)
    ? data.colors.map((color) => {
        const entry = color as Record<string, unknown>;
        return [
          String(entry.id ?? ''),
          String(entry.name ?? '').trim(),
          String(entry.hex ?? '').trim(),
          String(entry.imageUrl ?? '').trim(),
          String(entry.stockCount ?? ''),
          String(entry.inStock !== false),
        ].join(':');
      })
    : [];
  return [
    String(data.name ?? '').trim(),
    String(data.description ?? '').trim(),
    String(Number(data.priceThb) || 0),
    imageUrls.join(','),
    colors.join('|'),
    String(data.stockCount ?? ''),
    String(data.inStock !== false),
  ].join('|');
}

function collectMerchandiseImages(data: DocumentData): string[] {
  const urls = new Set<string>();
  const add = (value: unknown) => {
    const trimmed = String(value ?? '').trim();
    if (trimmed.startsWith('https://')) urls.add(trimmed);
  };
  if (Array.isArray(data.imageUrls)) {
    data.imageUrls.forEach(add);
  }
  add(data.imageUrl);
  if (Array.isArray(data.colors)) {
    data.colors.forEach((color) => {
      if (color && typeof color === 'object') {
        add((color as Record<string, unknown>).imageUrl);
      }
    });
  }
  return [...urls].slice(0, 8);
}

export async function syncMerchandiseToStripe(
  stripe: Stripe,
  merchId: string,
  data: DocumentData,
  hash: string,
  updateDoc: (fields: Record<string, unknown>) => Promise<void>,
): Promise<void> {
  const name = String(data.name ?? '').trim();
  if (!name) throw new Error('Product name is required before Stripe sync.');

  const priceThb = Math.max(0, Math.round(Number(data.priceThb) || 0));
  const stripeUnitAmount = thbToStripeUnitAmount(priceThb);
  const description = String(data.description ?? '').trim().slice(0, 500) || undefined;
  const images = collectMerchandiseImages(data);
  const stripeImages = images.length > 0 ? images : undefined;
  const inStock = data.inStock !== false;

  let stripeProductId = data.stripeProductId;
  if (!isConfiguredStripeProduct(stripeProductId)) {
    const product = await stripe.products.create({
      name,
      description,
      images: stripeImages,
      active: inStock,
      metadata: {
        firestoreId: merchId,
        source: 'sully-merchandise',
      },
    });
    stripeProductId = product.id;
  } else {
    await stripe.products.update(stripeProductId, {
      name,
      description,
      images: stripeImages,
      active: inStock,
    });
  }

  let stripePriceId = data.stripePriceId;
  if (isConfiguredStripePrice(stripePriceId)) {
    const existing = await stripe.prices.retrieve(stripePriceId);
    const sameAmount = existing.unit_amount === stripeUnitAmount;
    const sameCurrency = existing.currency === 'thb';
    if (!sameAmount || !sameCurrency) {
      await stripe.prices.update(stripePriceId, { active: false });
      stripePriceId = undefined;
    }
  }

  if (!isConfiguredStripePrice(stripePriceId)) {
    const price = await stripe.prices.create({
      product: stripeProductId,
      currency: 'thb',
      unit_amount: stripeUnitAmount,
    });
    stripePriceId = price.id;
  }

  await updateDoc({
    stripeProductId,
    stripePriceId,
    stripeSyncHash: hash,
    stripeSyncedAt: FieldValue.serverTimestamp(),
    stripeSyncError: FieldValue.delete(),
  });
}

export function onlineCourseSyncHash(data: DocumentData): string {
  return [
    String(data.title ?? '').trim(),
    String(data.description ?? '').trim(),
    String(Number(data.priceThb) || 0),
    String(data.thumbnailUrl ?? '').trim(),
    String(data.published === true),
  ].join('|');
}

export async function syncOnlineCourseToStripe(
  stripe: Stripe,
  courseId: string,
  data: DocumentData,
  hash: string,
  updateDoc: (fields: Record<string, unknown>) => Promise<void>,
): Promise<void> {
  const title = String(data.title ?? '').trim();
  if (!title) throw new Error('Course title is required before Stripe sync.');

  const priceThb = Math.max(0, Math.round(Number(data.priceThb) || 0));
  const stripeUnitAmount = thbToStripeUnitAmount(priceThb);
  const description = String(data.description ?? '').trim().slice(0, 500) || undefined;
  const thumbnailUrl = String(data.thumbnailUrl ?? '').trim();
  const stripeImages = thumbnailUrl.startsWith('https://') ? [thumbnailUrl] : undefined;
  const published = data.published === true;

  let stripeProductId = data.stripeProductId;
  if (!isConfiguredStripeProduct(stripeProductId)) {
    const product = await stripe.products.create({
      name: title,
      description,
      images: stripeImages,
      active: published,
      metadata: {
        firestoreId: courseId,
        source: 'sully-online-course',
      },
    });
    stripeProductId = product.id;
  } else {
    await stripe.products.update(stripeProductId, {
      name: title,
      description,
      images: stripeImages,
      active: published,
    });
  }

  let stripePriceId = data.stripePriceId;
  if (isConfiguredStripePrice(stripePriceId)) {
    const existing = await stripe.prices.retrieve(stripePriceId);
    const sameAmount = existing.unit_amount === stripeUnitAmount;
    const sameCurrency = existing.currency === 'thb';
    if (!sameAmount || !sameCurrency) {
      await stripe.prices.update(stripePriceId, { active: false });
      stripePriceId = undefined;
    }
  }

  if (!isConfiguredStripePrice(stripePriceId)) {
    const price = await stripe.prices.create({
      product: stripeProductId,
      currency: 'thb',
      unit_amount: stripeUnitAmount,
    });
    stripePriceId = price.id;
  }

  await updateDoc({
    stripeProductId,
    stripePriceId,
    stripeSyncHash: hash,
    stripeSyncedAt: FieldValue.serverTimestamp(),
    stripeSyncError: FieldValue.delete(),
  });
}
