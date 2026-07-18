import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import OnlineTest from "./pages/OnlineTest";
import OnlineTestSession from "./pages/OnlineTestSession";
import Shop from "./pages/Shop";
import OnlineCourseCatalog from "./pages/OnlineCourseCatalog";
import OnlineCoursePlayer from "./pages/OnlineCoursePlayer";
import Account from "./pages/Account";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import RequireGoogleAuth from "./components/RequireGoogleAuth";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { EcommerceAuthProvider } from "./context/EcommerceAuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import RequireAuth from "./components/RequireAuth";
import AdminShortcut from "./components/AdminShortcut";
import { LanguageToggle } from "./components/LanguageToggle";
import { CartIcon } from "./ecommerce/components/CartIcon";
import { RequireCustomerAuth } from "./ecommerce/components/RequireCustomerAuth";
import { useTranslation } from "./hooks/useTranslation";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const InterviewBookingRoutes = lazy(() =>
  import("./booking/InterviewBookingRoutes").then((m) => ({ default: m.InterviewBookingRoutes }))
);
const ShopRoutes = lazy(() =>
  import("./ecommerce/EcommerceRoutes").then((m) => ({ default: m.ShopRoutes }))
);
const CartPage = lazy(() =>
  import("./ecommerce/pages/CartPage").then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import("./ecommerce/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage }))
);
const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main
      className="container section"
      style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
    >
      <div>
        <p className="eyebrow">404</p>
        <h2>{t.common.pageNotFound}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {t.common.pageNotFoundDesc}
        </p>
        <Link to="/" className="button button-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          {t.common.backToHome}
        </Link>
      </div>
    </main>
  );
};

const PageFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
      }}
    >
      {t.common.loading}
    </div>
  );
};

const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const isOnlineTestSession = pathname.startsWith('/online-test/session');
  const isLoginPage = pathname === '/login';
  const isDashboard = pathname.startsWith('/dashboard');
  const showSiteChrome = !isAdminRoute && !isOnlineTestSession && !isLoginPage && !isDashboard;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <>
          <AdminShortcut />
          {!isAdminRoute && (
          <div className="background-shapes" aria-hidden="true">
            <span className="shape shape-one"></span>
            <span className="shape shape-two"></span>
            <span className="shape shape-three"></span>
          </div>
          )}

          {showSiteChrome && (
          <header className="site-header">
            <div className="container nav-shell">
              <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
                Sully Academy
              </Link>

              <button
                className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
                aria-label="Toggle Menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              <nav className={`main-nav${menuOpen ? ' is-open' : ''}`}>
                <a href="/#home" onClick={() => setMenuOpen(false)}>{t.common.home}</a>
                <Link to="/courses" onClick={() => setMenuOpen(false)}>{t.common.courses}</Link>
                <Link to="/shop" onClick={() => setMenuOpen(false)}>{t.common.shop}</Link>
                <CartIcon />
                <LanguageToggle />
                {!authLoading && (
                  user ? (
                    <Link
                      to="/dashboard"
                      className="nav-account-btn"
                      onClick={() => setMenuOpen(false)}
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="nav-account-avatar" />
                      ) : null}
                      <span>{t.common.dashboard}</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="nav-login-btn"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t.common.login}
                    </Link>
                  )
                )}
              </nav>
            </div>

            {menuOpen && (
              <div
                className="nav-overlay"
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
              />
            )}
          </header>
          )}

          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/online-courses" element={<OnlineCourseCatalog />} />
              <Route
                path="/online-courses/:courseId"
                element={
                  <RequireGoogleAuth>
                    <OnlineCoursePlayer />
                  </RequireGoogleAuth>
                }
              />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/account" element={<Account />} />
              <Route path="/online-test" element={<OnlineTest />} />
              <Route
                path="/online-test/session"
                element={
                  <RequireGoogleAuth>
                    <OnlineTestSession />
                  </RequireGoogleAuth>
                }
              />
              <Route path="/book/*" element={<InterviewBookingRoutes />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/shop/*" element={<ShopRoutes />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <RequireCustomerAuth>
                    <CheckoutPage />
                  </RequireCustomerAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminPanel />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          {showSiteChrome && (
          <footer className="site-footer">
            <div className="container footer-shell">
              <p>© {new Date().getFullYear()} Sully Academy. {t.footer.copyright}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.common.terms}</a>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.common.privacy}</a>
                <Link to="/auth" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{t.common.admin}</Link>
              </div>
            </div>
          </footer>
          )}
    </>
  );
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <EcommerceAuthProvider>
      <AppShell />
    </EcommerceAuthProvider>
  </BrowserRouter>
);

const App: React.FC = () => (
  <LanguageProvider>
    <AuthProvider>
      <DataProvider>
        <AppRouter />
      </DataProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
