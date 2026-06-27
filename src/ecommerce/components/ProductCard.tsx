import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/shop/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.imageURL ? (
          <img src={product.imageURL} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">{product.type === 'course' ? 'Course' : 'Merch'}</div>
        )}
        {product.compareAtPrice != null && product.compareAtPrice > product.price && (
          <span className="product-card-sale">Sale</span>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-card-type">{product.type === 'course' ? 'Online Course' : 'Merchandise'}</span>
        <h3>{product.title}</h3>
        <p className="product-card-price">
          {formatCurrency(product.price)}
          {product.compareAtPrice != null && product.compareAtPrice > product.price && (
            <s>{formatCurrency(product.compareAtPrice)}</s>
          )}
        </p>
      </div>
    </Link>
  );
}
