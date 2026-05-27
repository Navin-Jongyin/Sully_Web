import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import AdminPanel from "./pages/AdminPanel";
import { DataProvider } from "./context/DataContext";
import "./App.css";

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
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
            <a
  href="https://sullytest.com"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setMenuOpen(false)}
  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105"
>
  ✈ Practice
</a>
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
          </div>
        </div>
      </footer>
    </BrowserRouter>
    </DataProvider>
  );
};

export default App;