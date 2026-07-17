const DEFAULT_STRIPE_CATALOG_URL = 'https://stripe-server-3dqx.onrender.com';

export interface StripeCatalogProduct {
  priceId: string;
  productId: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
}

interface StripeCatalogResponse {
  products?: StripeCatalogProduct[];
}

let productCache: Promise<StripeCatalogProduct[]> | null = null;

function catalogBaseUrl(): string {
  return (
    import.meta.env.VITE_STRIPE_CATALOG_API_URL
    || DEFAULT_STRIPE_CATALOG_URL
  ).replace(/\/$/, '');
}

async function fetchProducts(): Promise<StripeCatalogProduct[]> {
  if (!productCache) {
    productCache = fetch(`${catalogBaseUrl()}/products`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Stripe catalog failed (${response.status}).`);
        const payload = await response.json() as StripeCatalogResponse;
        return Array.isArray(payload.products) ? payload.products : [];
      })
      .catch((error) => {
        productCache = null;
        throw error;
      });
  }
  return productCache;
}

export async function getStripeProductById(
  productId?: string,
): Promise<StripeCatalogProduct | null> {
  if (!productId || productId === 'STRIPE_PRODUCT_ID_PLACEHOLDER') return null;
  const products = await fetchProducts();
  return products.find((product) => product.productId === productId) ?? null;
}

export function formatStripeAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(currency.toLowerCase() === 'thb' ? 'th-TH' : 'en', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
