import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { createCheckoutSession, formatThb } from '../lib/payments';
import { subscribeCourseEntitlements } from '../lib/purchases';
import {
  formatStripeAmount,
  getStripeProductById,
  type StripeCatalogProduct,
} from '../lib/stripe-catalog';
import '../commerce/commerce.css';

const OnlineCoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { onlineVideoCourses } = useData();
  const [searchParams] = useSearchParams();
  const [owned, setOwned] = useState<string[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeProducts, setStripeProducts] = useState<Record<string, StripeCatalogProduct | null>>({});

  useEffect(() => {
    if (!user) return;
    return subscribeCourseEntitlements(user.uid, setOwned);
  }, [user]);

  const published = onlineVideoCourses.filter((c) => c.published);
  const visibleOwned = user ? owned : [];

  useEffect(() => {
    let active = true;
    void Promise.all(
      onlineVideoCourses.filter((course) => course.published).map(async (course) => [
        course.id,
        await getStripeProductById(course.stripeProductId),
      ] as const),
    )
      .then((entries) => {
        if (active) setStripeProducts(Object.fromEntries(entries));
      })
      .catch(() => {
        if (active) setError('Stripe product details are temporarily unavailable.');
      });
    return () => {
      active = false;
    };
  }, [onlineVideoCourses]);

  const handleBuy = async (courseId: string) => {
    if (!user) return;
    setError(null);
    setBuyingId(courseId);
    try {
      const { url } = await createCheckoutSession({
        courseId,
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
          <p className="eyebrow">{t.commerce.onlineCoursesEyebrow}</p>
          <h2>{t.commerce.onlineCoursesTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            {t.commerce.onlineCoursesDesc}
          </p>
        </div>

        {!user && (
          <div className="commerce-login-hint">
            <Lock size={18} />
            <p>{t.commerce.loginToBuy}</p>
            <Link to="/login" className="button button-primary">{t.commerce.goToAccount}</Link>
          </div>
        )}

        {error && <p role="alert" className="commerce-error">{error}</p>}
        {searchParams.get('purchase') === 'cancelled' && (
          <p role="status" className="commerce-notice">
            Checkout was cancelled. You have not been charged.
          </p>
        )}

        {published.length === 0 ? (
          <div className="commerce-empty">
            <BookOpen size={40} />
            <p>{t.commerce.noOnlineCourses}</p>
          </div>
        ) : (
          <div className="commerce-grid">
            {published.map((course) => {
              const isOwned = visibleOwned.includes(course.id);
              const stripeProduct = stripeProducts[course.id];
              const paymentConfigured = Boolean(stripeProduct);
              return (
                <article key={course.id} className="commerce-card">
                  <div className="commerce-card-image">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} loading="lazy" />
                    ) : (
                      <div className="commerce-card-image-placeholder">
                        <BookOpen size={32} />
                      </div>
                    )}
                    {isOwned && (
                      <span className="commerce-owned-badge">
                        <CheckCircle size={14} /> {t.commerce.owned}
                      </span>
                    )}
                  </div>
                  <div className="commerce-card-body">
                    <span className="commerce-card-tag">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p className="commerce-meta">
                      {course.lessonCount ?? course.lessons.length} {t.commerce.lessons}
                      {course.instructor ? ` · ${course.instructor}` : ''}
                    </p>
                    <div className="commerce-card-footer">
                      <strong>
                        {stripeProduct
                          ? formatStripeAmount(stripeProduct.amount, stripeProduct.currency)
                          : formatThb(course.priceThb)}
                      </strong>
                      {isOwned ? (
                        <Link to={`/online-courses/${course.id}`} className="button button-primary">
                          <Play size={16} /> {t.commerce.watch}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="button button-primary"
                          disabled={!user || buyingId === course.id || !paymentConfigured}
                          onClick={() => handleBuy(course.id)}
                        >
                          {buyingId === course.id
                            ? t.commerce.processing
                            : paymentConfigured
                              ? t.commerce.buyNow
                              : 'Not configured'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default OnlineCoursesPage;
