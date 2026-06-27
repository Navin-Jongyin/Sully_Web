import { Link } from 'react-router-dom';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import { useEnrollments } from '../hooks/useEnrollments';
import { useOrders } from '../hooks/useOrders';
import { useWishlist } from '../hooks/useWishlist';
import { formatCurrency } from '../lib/formatCurrency';

export function DashboardPage() {
  const { profile, signOut } = useEcommerceAuth();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { orders, loading: ordersLoading } = useOrders();
  const { items: wishlist } = useWishlist();

  return (
    <main className="container section shop-page">
      <div className="dashboard-header">
        <div>
          <h1>My account</h1>
          <p className="hint">Welcome, {profile?.displayName || profile?.email}</p>
        </div>
        <button type="button" className="button button-secondary" onClick={() => signOut()}>Sign out</button>
      </div>

      <section className="dashboard-section">
        <h2>My courses</h2>
        {enrollmentsLoading ? (
          <p className="hint">Loading…</p>
        ) : enrollments.length === 0 ? (
          <p className="hint">No enrolled courses yet. <Link to="/shop/courses">Browse courses</Link></p>
        ) : (
          <div className="dashboard-grid">
            {enrollments.map((e) => (
              <Link key={e.courseId} to={`/account/courses/${e.courseId}`} className="dashboard-card">
                {e.thumbnailURL && <img src={e.thumbnailURL} alt="" />}
                <h3>{e.title}</h3>
                <p>{e.progress.completionPercent}% complete</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Order history</h2>
        {ordersLoading ? (
          <p className="hint">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="hint">No orders yet.</p>
        ) : (
          <ul className="order-list">
            {orders.map((o) => (
              <li key={o.orderId} className="order-item">
                <div>
                  <strong>{o.orderId}</strong>
                  <span className={`order-badge order-badge--${o.status}`}>{o.status}</span>
                </div>
                <p>{formatCurrency(o.total)} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="hint">Your wishlist is empty.</p>
        ) : (
          <ul>{wishlist.map((w) => <li key={w.productId}>{w.title} — {formatCurrency(w.price)}</li>)}</ul>
        )}
      </section>
    </main>
  );
}
