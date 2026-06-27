import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { ProductType } from '../types';

export function ShopPage({ type }: { type?: ProductType }) {
  const { products, loading } = useProducts(type);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesLevel = !level || p.level === level;
      return matchesSearch && matchesLevel;
    });
  }, [products, search, level]);

  const title = type === 'course' ? 'Online Courses' : type === 'merch' ? 'Merchandise' : 'Shop';

  return (
    <main className="container section shop-page">
      <div className="shop-header">
        <div>
          <p className="eyebrow">Store</p>
          <h1>{title}</h1>
        </div>
        <div className="shop-tabs">
          <Link to="/shop" className={!type ? 'is-active' : ''}>All</Link>
          <Link to="/shop/courses" className={type === 'course' ? 'is-active' : ''}>Courses</Link>
          <Link to="/shop/merch" className={type === 'merch' ? 'is-active' : ''}>Merch</Link>
        </div>
      </div>

      <div className="shop-filters">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {type !== 'merch' && (
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        )}
      </div>

      {loading ? (
        <p className="hint">Loading products…</p>
      ) : filtered.length === 0 ? (
        <p className="hint">No products found. Add items in the store admin.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
