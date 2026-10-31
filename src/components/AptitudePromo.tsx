import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { Star } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

interface AptitudeReview {
  id: string;
  uid: string;
  displayName: string;
  rating: number;
  comment: string;
  updatedAt: number;
}

const TEST_URL = 'https://sully-test.com/';

function maskName(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length <= 1) return chars[0] ?? '';
  return `${chars[0]}${'*'.repeat(chars.length - 1)}`;
}

const TEST_PREVIEWS = [
  { src: '/aptitude/shape.svg', title: 'Shape Scanning' },
  { src: '/aptitude/cube-unfold.svg', title: 'Cube Unfold' },
  { src: '/aptitude/deviation.svg', title: 'String Deviation' },
  { src: '/aptitude/series.svg', title: 'Series Number' },
];

function Stars({ value, onChange }: { value: number; onChange?: (next: number) => void }) {
  return (
    <div className="aptitude-stars" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'is-on' : ''}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={onChange ? star === value : undefined}
          disabled={!onChange}
          onClick={() => onChange?.(star)}
        >
          <Star size={18} fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

const AptitudePromo: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AptitudeReview[]>([]);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, 'aptitudeReviews'), (snapshot) => {
      const next = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          uid: String(data.uid || entry.id),
          displayName: String(data.displayName || 'Student'),
          rating: Number(data.rating) || 0,
          comment: String(data.comment || ''),
          updatedAt: typeof data.updatedAt?.toMillis === 'function' ? data.updatedAt.toMillis() : 0,
        };
      });
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      setReviews(next);
    });
  }, []);

  const mine = reviews.find((review) => review.uid === user?.uid);

  useEffect(() => {
    if (!user) return;
    if (mine) {
      setRating(mine.rating || 5);
      setComment(mine.comment);
      setName(mine.displayName);
      return;
    }
    setName((user.displayName || user.email?.split('@')[0] || '').slice(0, 80));
  }, [user?.uid, user?.displayName, user?.email, mine?.uid, mine?.rating, mine?.comment, mine?.displayName]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const text = comment.trim();
    const displayName = name.trim().slice(0, 80);
    if (!text || !displayName) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'aptitudeReviews', user.uid), {
        uid: user.uid,
        displayName,
        rating,
        comment: text.slice(0, 500),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your review.');
    } finally {
      setSaving(false);
    }
  };

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

      <div className="aptitude-board">
        <form className="aptitude-form" onSubmit={submit}>
          <h3>{t.home.aptitudeRateTitle}</h3>
          {user ? (
            <>
              <Stars value={rating} onChange={setRating} />
              <label className="aptitude-field">
                <span>{t.home.aptitudeName}</span>
                <input
                  type="text"
                  value={name}
                  maxLength={80}
                  required
                  placeholder={t.home.aptitudeNamePlaceholder}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <textarea
                value={comment}
                maxLength={500}
                required
                placeholder={t.home.aptitudeCommentPlaceholder}
                onChange={(event) => setComment(event.target.value)}
              />
              {error && <p className="aptitude-error" role="alert">{error}</p>}
              <button type="submit" className="button button-primary" disabled={saving || !comment.trim() || !name.trim()}>
                {saving ? t.common.loading : mine ? t.home.aptitudeUpdate : t.home.aptitudeSubmit}
              </button>
            </>
          ) : (
            <Link to="/login" className="button button-secondary">{t.home.aptitudeSignIn}</Link>
          )}
        </form>

        <div className="aptitude-list">
          {reviews.length === 0 ? (
            <p className="aptitude-empty">{t.home.aptitudeNoReviews}</p>
          ) : reviews.map((review) => (
            <article key={review.id}>
              <div>
                <strong>{maskName(review.displayName)}</strong>
                <Stars value={review.rating} />
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AptitudePromo;
