import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useProductBySlug } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';
import { formatCurrency } from '../lib/formatCurrency';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProductBySlug(slug);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  if (loading) {
    return (
      <main className="container section shop-page">
        <p className="hint">Loading…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container section shop-page">
        <h2>Product not found</h2>
        <Link to="/shop">Back to shop</Link>
      </main>
    );
  }

  const selectedVariant = product.variants?.find((v) => v.variantId === variantId) ?? null;
  const price = selectedVariant?.price ?? product.price;
  const cartProduct: Product = { ...product, price };

  async function handleAddToCart() {
    try {
      await addToCart(
        cartProduct,
        {
          variantId,
          variantLabel: selectedVariant?.label ?? null,
          quantity: cartProduct.type === 'merch' ? qty : 1,
        },
      );
      setMessage('Added to cart.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not add to cart.');
    }
  }

  return (
    <main className="container section shop-page">
      <Link to="/shop" className="shop-back-link">← Back to shop</Link>
      <div className="product-detail">
        <div className="product-detail-media">
          {product.imageURL ? (
            <img src={product.imageURL} alt={product.title} />
          ) : (
            <div className="product-card-placeholder">No image</div>
          )}
        </div>
        <div className="product-detail-info">
          <span className="product-card-type">{product.type === 'course' ? 'Online Course' : 'Merchandise'}</span>
          <h1>{product.title}</h1>
          <p className="product-detail-price">{formatCurrency(price)}</p>
          <p>{product.description}</p>

          {product.type === 'merch' && product.variants && product.variants.length > 0 && (
            <label>
              Variant
              <select value={variantId || ''} onChange={(e) => setVariantId(e.target.value || null)}>
                <option value="">Select option</option>
                {product.variants.map((v) => (
                  <option key={v.variantId} value={v.variantId}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {product.type === 'merch' && (
            <label>
              Quantity
              <input type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </label>
          )}

          <div className="product-detail-actions">
            <button type="button" className="button button-primary" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => addToWishlist(product).catch((e) => setMessage(e.message))}
            >
              Wishlist
            </button>
          </div>
          {message && <p className="hint">{message}</p>}

          {product.type === 'course' && product.whatYouLearn && (
            <>
              <h3>What you&apos;ll learn</h3>
              <ul>{product.whatYouLearn.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
