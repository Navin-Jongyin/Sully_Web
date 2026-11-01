import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Star } from 'lucide-react';
import { aptitudeDb } from '../lib/aptitude-firebase';
import { useTranslation } from '../hooks/useTranslation';

interface HubReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

const TEST_URL = 'https://sully-test.com/';

const TEST_PREVIEWS = [
  { src: '/aptitude/shape.svg', title: 'Shape Scanning' },
  { src: '/aptitude/cube-unfold.svg', title: 'Cube Unfold' },
  { src: '/aptitude/deviation.svg', title: 'String Deviation' },
  { src: '/aptitude/series.svg', title: 'Series Number' },
];

function maskName(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length <= 1) return chars[0] ?? '';
  return `${chars[0]}${'*'.repeat(chars.length - 1)}`;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="aptitude-stars" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= value ? 'is-on' : ''}>
          <Star size={18} fill={star <= value ? 'currentColor' : 'none'} />
        </span>
      ))}
    </div>
  );
}

const AptitudePromo: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<HubReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aptitudeDb) {
      setError('Reviews are not configured.');
      return;
    }
    return onSnapshot(collection(aptitudeDb, 'hubReviews'), (snapshot) => {
      const next = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          userName: String(data.userName || 'Player'),
          rating: Number(data.rating) || 0,
          comment: String(data.comment || ''),
          createdAt: typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : 0,
        };
      });
      next.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(next);
      setError(null);
    }, () => {
      setError('Could not load reviews.');
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const fitFive = () => {
      const articles = [...list.querySelectorAll(':scope > article')];
      if (articles.length <= 5) {
        list.style.maxHeight = '';
        list.classList.remove('is-scroll');
        return;
      }
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      const height = articles
        .slice(0, 5)
        .reduce((sum, article) => sum + article.getBoundingClientRect().height, 0);
      list.style.maxHeight = `${Math.ceil(height + gap * 4)}px`;
      list.classList.add('is-scroll');
    };

    fitFive();
    const observer = new ResizeObserver(fitFive);
    list.querySelectorAll(':scope > article').forEach((article) => observer.observe(article));
    return () => observer.disconnect();
  }, [reviews]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <section className="container section aptitude-promo" id="aptitude">
      <div className="aptitude-hero">
        <div>
          <p className="eyebrow">{t.home.aptitudeEyebrow}</p>
          <h2>{t.home.aptitudeTitle}</h2>
          <p>{t.home.aptitudeDesc}</p>
          <a className="button button-purple" href={TEST_URL} target="_blank" rel="noopener noreferrer">
            {t.home.aptitudeOpen}
          </a>
        </div>
        <div className="aptitude-visual">
          <div className="aptitude-previews">
            {TEST_PREVIEWS.map((preview) => (
              <a key={preview.title} href={TEST_URL} target="_blank" rel="noopener noreferrer">
                <img src={preview.src} alt={preview.title} width={320} height={160} />
                <span>{preview.title}</span>
              </a>
            ))}
          </div>
          <div className="aptitude-score" aria-label={t.home.aptitudeReviews}>
            <strong>{reviews.length ? average.toFixed(1) : '—'}</strong>
            <Stars value={Math.round(average)} />
            <span>{reviews.length} {t.home.aptitudeReviews}</span>
          </div>
        </div>
      </div>

      <div className="aptitude-list" ref={listRef}>
        {error ? (
          <p className="aptitude-error" role="alert">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="aptitude-empty">{t.home.aptitudeNoReviews}</p>
        ) : reviews.map((review) => (
          <article key={review.id}>
            <div>
              <strong>{maskName(review.userName)}</strong>
              <Stars value={review.rating} />
            </div>
            {review.comment && <p>{review.comment}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default AptitudePromo;
