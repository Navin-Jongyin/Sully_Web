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

export type VideoProvider =
  | 'auto'
  | 'youtube'
  | 'vimeo'
  | 'bunny'
  | 'cloudflare'
  | 'mux'
  | 'direct'
  | 'iframe';

/** Provider-neutral course lesson. Legacy Mux fields remain migration-compatible. */
export interface OnlineCourseLesson {
  id: string;
  courseId?: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  videoUrl?: string;
  videoProvider?: VideoProvider;
  /** Mux Playback ID — placeholder until Mux upload pipeline is ready */
  muxPlaybackId?: string;
  /** Mux Asset ID — set after upload to Mux */
  muxAssetId?: string;
  order: number;
}

/** Purchasable online course. */
export interface OnlineVideoCourse {
  id: string;
  title: string;
  description: string;
  category: 'Student Pilot' | 'Qualified Pilot' | 'ATC' | 'Other';
  priceThb: number;
  thumbnailUrl: string;
  instructor?: string;
  lessons: OnlineCourseLesson[];
  lessonCount?: number;
  published: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseProductType = 'course' | 'merchandise';

export type PurchaseStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

/** Order / purchase record written by payment webhook (placeholder client writes for now). */
export interface PurchaseRecord {
  id: string;
  uid: string;
  email: string;
  productType: PurchaseProductType;
  productId: string;
  courseId?: string;
  productTitle: string;
  amountThb: number;
  amountPaidMinor?: number;
  currency?: string;
  status: PurchaseStatus;
  /** Stripe Checkout Session ID when payment service is live */
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt: unknown;
  paidAt?: unknown;
  purchaseDate?: unknown;
}

/** Entitlement unlock after successful course payment. */
export interface CourseEntitlement {
  courseId: string;
  uid: string;
  purchaseId: string;
  unlockedAt: unknown;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  currentTimeSeconds: number;
  durationSeconds: number;
  completed: boolean;
  completedAt?: unknown;
  updatedAt?: unknown;
}

export interface CourseProgress {
  courseId: string;
  uid: string;
  lastLessonId?: string;
  completedLessonIds: string[];
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  lastAccessedAt?: unknown;
  completedAt?: unknown;
}
