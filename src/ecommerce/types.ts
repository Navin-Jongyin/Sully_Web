export type ProductType = 'course' | 'merch';
export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'failed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CouponType = 'percent' | 'fixed';

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  stripeCustomerId: string;
}

export interface CartItem {
  productId: string;
  productType: ProductType;
  title: string;
  price: number;
  quantity: number;
  imageURL: string;
  variantId: string | null;
  variantLabel: string | null;
  addedAt: string;
}

export interface OrderLineItem {
  productId: string;
  productType: ProductType;
  title: string;
  price: number;
  quantity: number;
  variantId: string | null;
  variantLabel: string | null;
  imageURL: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentIntentId: string;
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  tax: number;
  shipping: number;
  total: number;
  currency: 'usd';
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentProgress {
  completedLessonIds: string[];
  lastLessonId: string | null;
  lastAccessedAt: string | null;
  completionPercent: number;
  completedAt: string | null;
}

export interface Enrollment {
  courseId: string;
  orderId: string;
  title: string;
  thumbnailURL: string;
  enrolledAt: string;
  progress: EnrollmentProgress;
  certificateIssued: boolean;
  certificateURL: string | null;
}

export interface WishlistItem {
  productId: string;
  productType: ProductType;
  title: string;
  price: number;
  imageURL: string;
  addedAt: string;
}

export interface Lesson {
  lessonId: string;
  title: string;
  duration: string;
  videoURL: string;
  isPreview: boolean;
}

export interface SyllabusSection {
  sectionTitle: string;
  lessons: Lesson[];
}

export interface MerchVariant {
  variantId: string;
  label: string;
  sku: string;
  price: number | null;
  inventory: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  slug: string;
  description: string;
  richDescription: string;
  price: number;
  compareAtPrice: number | null;
  currency: 'usd';
  imageURL: string;
  galleryURLs: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // course
  instructor?: string;
  instructorPhotoURL?: string;
  duration?: string;
  level?: CourseLevel;
  language?: string;
  totalLessons?: number;
  previewVideoURL?: string;
  syllabus?: SyllabusSection[];
  whatYouLearn?: string[];
  requirements?: string[];
  certificate?: boolean;
  // merch
  sku?: string;
  inventory?: number;
  trackInventory?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  variants?: MerchVariant[];
  shippingRequired?: boolean;
}

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  appliesToProductIds: string[] | null;
  isActive: boolean;
}

export interface GuestCartItem extends Omit<CartItem, 'addedAt'> {
  addedAt?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}
