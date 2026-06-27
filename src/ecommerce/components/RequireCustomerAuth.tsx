import { Navigate, useLocation } from 'react-router-dom';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';

export function RequireCustomerAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useEcommerceAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="container section shop-page">
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
