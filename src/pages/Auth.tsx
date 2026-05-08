import React, { useState } from 'react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (username === 'admin' && password === 'sullyacademy2014') {
        alert('Welcome to the Admin Panel!');
        // Redirect to the new admin dashboard
        window.location.href = '/admin'; 
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } else {
      alert('Sign up functionality is currently disabled.');
    }
  };

  return (
    <main className="container section" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card reveal is-visible" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>{isLogin ? 'Admin Access' : 'Create Account'}</h2>
          <p style={{ marginTop: '0.5rem' }}>{isLogin ? 'Log in to access the control panel' : 'Sign up to start learning today'}</p>
        </div>

        <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Full Name
              <input type="text" placeholder="Jane Doe" required />
            </label>
          )}
          <label>
            Username
            <input 
              type="text" 
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </label>
          <label>
            Password
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>

          <button className="button button-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', transition: 'var(--transition)' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Auth;
