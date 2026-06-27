import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import '../ecommerce.css';

export function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts();

  if (loading || products.length === 0) return null;

  return (
    <section className="container section">
      <div className="section-head reveal is-visible">
        <p className="eyebrow">Shop</p>
        <h2>Featured courses &amp; merchandise</h2>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/shop" className="button button-primary">Browse shop</Link>
      </div>
    </section>
  );
}
