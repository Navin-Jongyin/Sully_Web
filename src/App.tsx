import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="background-shapes" aria-hidden="true">
        <span className="shape shape-one"></span>
        <span className="shape shape-two"></span>
        <span className="shape shape-three"></span>
      </div>

      <header className="site-header">
        <div className="container nav-shell">
          <Link className="brand" to="/">Sully Academy</Link>

          <button className="menu-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className="main-nav">
            <Link to="/">Home</Link>
            <a href="/#about">About</a>
            <a href="/#courses">Courses</a>
            <a href="/#achievements">Achievements</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#contact">Contact</a>
            <Link className="nav-cta" to="/auth">Login / My Courses</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>

      <footer className="site-footer">
        <div className="container footer-shell">
          <p>© {new Date().getFullYear()} Sully Academy. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  );
};

export default App;