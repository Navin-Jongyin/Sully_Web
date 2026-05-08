import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import AdminPanel from "./pages/AdminPanel";
import { DataProvider } from "./context/DataContext";
import "./App.css";

const App: React.FC = () => {
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
          <Link className="brand" to="/">Sully Academy</Link>

          <button className="menu-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className="main-nav">
            <a href="/#home">Home</a>
            <a href="/#about">About</a>
            <a href="/#achievements">Achievements</a>
            <a href="/#news">News</a>
            <a href="/#contact">Contact</a>
             <Link to="/courses">Courses</Link>
          </nav>
        </div>
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