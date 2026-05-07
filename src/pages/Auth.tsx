import React, { useState } from 'react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="container section" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card reveal is-visible" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ marginTop: '0.5rem' }}>{isLogin ? 'Log in to access your courses' : 'Sign up to start learning today'}</p>
        </div>

        <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <label>
              Full Name
              <input type="text" placeholder="Jane Doe" required />
            </label>
          )}
          <label>
            Email Address
            <input type="email" placeholder="jane@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required />
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
