import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppDialog } from '../hooks/useAppDialog';
import './commerce.css';

interface AptitudeReviewRow {
  id: string;
  displayName: string;
  rating: number;
  comment: string;
  updatedAt: number;
}

const AptitudeReviewAdminPanel: React.FC = () => {
  const { confirm } = useAppDialog();
  const [reviews, setReviews] = useState<AptitudeReviewRow[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, 'aptitudeReviews'), (snapshot) => {
      const next = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          displayName: String(data.displayName || 'Student'),
          rating: Number(data.rating) || 0,
          comment: String(data.comment || ''),
          updatedAt: typeof data.updatedAt?.toMillis === 'function' ? data.updatedAt.toMillis() : 0,
        };
      });
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      setReviews(next);
    }, () => {
      setError('Could not load reviews.');
    });
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((review) =>
      review.displayName.toLowerCase().includes(term)
      || review.comment.toLowerCase().includes(term),
    );
  }, [reviews, search]);

  const deleteReview = async (review: AptitudeReviewRow) => {
    const confirmed = await confirm(`Delete the review from ${review.displayName}?`);
    if (!confirmed) return;
    setDeletingId(review.id);
    setError(null);
    try {
      await deleteDoc(doc(db, 'aptitudeReviews', review.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the review.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="intake-admin-list">
      <input
        className="intake-admin-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or comment"
        aria-label="Search name or comment"
      />
      {error && <p className="commerce-error" role="alert">{error}</p>}
      {reviews.length === 0 && !error ? (
        <p style={{ color: 'var(--text-secondary)' }}>No reviews yet.</p>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No matching name or comment.</p>
      ) : (
        visible.map((review) => (
          <article key={review.id} className="review-admin-item">
            <div>
              <strong>{review.displayName}</strong>
              <small>{review.rating} / 5</small>
              <p>{review.comment}</p>
            </div>
            <button
              type="button"
              className="intake-admin-delete"
              disabled={deletingId === review.id}
              onClick={() => void deleteReview(review)}
            >
              {deletingId === review.id ? 'Deleting…' : 'Delete'}
            </button>
          </article>
        ))
      )}
    </div>
  );
};

export default AptitudeReviewAdminPanel;
