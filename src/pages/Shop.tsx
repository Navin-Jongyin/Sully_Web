import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { createCheckoutSession, formatThb } from '../lib/payments';
import '../commerce/commerce.css';

const Shop: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { merchandise } = useData();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (productId: string) => {
    if (!user?.email) return;
    setError(null);
    setBuyingId(productId);
    try {
      const { url } = await createCheckoutSession({
        items: [{ productType: 'merchandise', productId, quantity: 1 }],
        uid: user.uid,
        email: user.email,
        successUrl: `${window.location.origin}/dashboard?purchase=success`,
        cancelUrl: `${window.location.origin}/shop?purchase=cancelled`,
      });
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.commerce.purchaseError);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <main className="page-transition commerce-page">
      <section className="container section" style={{ paddingTop: 'clamp(2rem, 8vw, 7.5rem)' }}>
        <div className="section-head reveal is-visible">
          <p className="eyebrow">{t.commerce.shopEyebrow}</p>
          <h2>{t.commerce.shopTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            {t.commerce.shopDesc}
          </p>
        </div>

        {!user && (
          <div className="commerce-login-hint">
            <Lock size={18} />
            <p>{t.commerce.loginToBuy}</p>
            <Link to="/login" className="button button-primary">{t.commerce.goToAccount}</Link>
          </div>
        )}

        {error && (
          <p role="alert" className="commerce-error">{error}</p>
        )}

        {merchandise.length === 0 ? (
          <div className="commerce-empty">
            <ShoppingBag size={40} />
            <p>{t.commerce.noMerchandise}</p>
          </div>
        ) : (
          <div className="commerce-grid">
            {merchandise.map((item) => (
              <article key={item.id} className="commerce-card">
                <div className="commerce-card-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <div className="commerce-card-image-placeholder">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                </div>
                <div className="commerce-card-body">
                  <span className="commerce-card-tag">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="commerce-card-footer">
                    <strong>{formatThb(item.priceThb)}</strong>
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={!user || !item.inStock || buyingId === item.id}
                      onClick={() => handleBuy(item.id)}
                    >
                      {!item.inStock
                        ? t.commerce.outOfStock
                        : buyingId === item.id
                          ? t.commerce.processing
                          : t.commerce.buyNow}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;
