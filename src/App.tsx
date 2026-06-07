import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import "./App.css";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const NotFound: React.FC = () => (
  <main
    className="container section"
    style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
  >
    <div>
      <p className="eyebrow">404</p>
      <h2>Page not found</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="button button-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
        Back to Home
      </Link>
    </div>
  </main>
);

const PageFallback: React.FC = () => (
  <div
    style={{
      height: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
    }}
  >
    Loading…
  </div>
);

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
<<<<<<< HEAD
    <DataProvider>
      <BrowserRouter>
      <div className="background-shapes" aria-hidden="true">
        <span className="shape shape-one"></span>
        <span className="shape shape-two"></span>
        <span className="shape shape-three"></span>
      </div>

      <header className="site-header">
        <div className="container nav-shell">
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>Sully Academy</Link>

          <button
            className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`main-nav${menuOpen ? ' is-open' : ''}`}>
            <a href="/#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/#achievements" onClick={() => setMenuOpen(false)}>Achievements</a>
            <a href="/#news" onClick={() => setMenuOpen(false)}>News</a>
            <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
            <a href="https://sully-test.com" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="external-cta-button">✈ Aptitude Practice</a>
            
          </nav>
        </div>

        {/* Mobile overlay to close menu */}
        {menuOpen && (
          <div
            className="nav-overlay"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>

      <footer className="site-footer">
        <div className="container footer-shell">
          <p>© {new Date().getFullYear()} Sully Academy. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</a>
            <Link to="/auth" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin</Link>
=======
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="background-shapes" aria-hidden="true">
            <span className="shape shape-one"></span>
            <span className="shape shape-two"></span>
            <span className="shape shape-three"></span>
>>>>>>> 8f9749b (update)
          </div>

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
                <a href="/#home" onClick={() => setMenuOpen(false)}>Home</a>
                <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
                <a href="/#achievements" onClick={() => setMenuOpen(false)}>Achievements</a>
                <a href="/#news" onClick={() => setMenuOpen(false)}>News</a>
                <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
                <Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
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

          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
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

          <footer className="site-footer">
            <div className="container footer-shell">
              <p>© {new Date().getFullYear()} Sully Academy. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</a>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</a>
                <Link to="/auth" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin</Link>
              </div>
            </div>
          </footer>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
