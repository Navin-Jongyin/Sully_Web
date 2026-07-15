/** Catalog item sold in the merchandise shop. */
export interface MerchandiseProduct {
  id: string;
  name: string;
  description: string;
  priceThb: number;
  imageUrl: string;
  category: 'apparel' | 'accessory' | 'other';
  inStock: boolean;
  /** Stripe Price ID — filled when payment service is live */
  stripePriceId?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Video lesson powered by Mux (placeholder until Mux service exists). */
export interface OnlineCourseLesson {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  /** Mux Playback ID — placeholder until Mux upload pipeline is ready */
  muxPlaybackId?: string;
  /** Mux Asset ID — set after upload to Mux */
  muxAssetId?: string;
  order: number;
}

/** Purchasable online course with Mux-backed lessons. */
export interface OnlineVideoCourse {
  id: string;
  title: string;
  description: string;
  category: 'Student Pilot' | 'Qualified Pilot' | 'ATC' | 'Other';
  priceThb: number;
  thumbnailUrl: string;
  lessons: OnlineCourseLesson[];
  published: boolean;
  stripePriceId?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseProductType = 'course' | 'merchandise';

export type PurchaseStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Order / purchase record written by payment webhook (placeholder client writes for now). */
export interface PurchaseRecord {
  id: string;
  uid: string;
  email: string;
  productType: PurchaseProductType;
  productId: string;
  productTitle: string;
  amountThb: number;
  status: PurchaseStatus;
  /** Stripe Checkout Session ID when payment service is live */
  stripeSessionId?: string;
  createdAt: string;
  paidAt?: string;
}

/** Entitlement unlock after successful course payment. */
export interface CourseEntitlement {
  courseId: string;
  uid: string;
  purchaseId: string;
  unlockedAt: string;
}
