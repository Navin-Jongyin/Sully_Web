import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import RequireAuth from "./components/RequireAuth";
import AdminShortcut from "./components/AdminShortcut";
import { LanguageToggle } from "./components/LanguageToggle";
import { useTranslation } from "./hooks/useTranslation";
import "./App.css";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const InterviewBookingRoutes = lazy(() =>
  import("./booking/InterviewBookingRoutes").then((m) => ({ default: m.InterviewBookingRoutes }))
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
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize
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

          {!isAdminRoute && (
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
                <Link to="/book" onClick={() => setMenuOpen(false)}>{t.home.bookInterview}</Link>
                <Link to="/courses" onClick={() => setMenuOpen(false)}>{t.common.courses}</Link>
                <a
                  href="https://sully-test.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="external-cta-button"
                >
                  ✈ {t.home.aptitudePractice}
                </a>
                <LanguageToggle />
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
              <Route path="/book/*" element={<InterviewBookingRoutes />} />
              <Route path="/auth" element={<Auth />} />
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

          {!isAdminRoute && (
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
    <AppShell />
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
