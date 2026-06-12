import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthErrorCode, isAuthError } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: { pathname?: string };
}

const Auth: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        switch (getAuthErrorCode(err)) {
          case 'credentials-not-found':
            setError('Admin credentials were not found in Firebase.');
            break;
          case 'invalid-credentials':
            setError('Invalid username or password.');
            break;
          case 'network':
            setError('Could not verify credentials. Try again.');
            break;
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="container section"
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="card reveal is-visible"
        style={{ width: '100%', maxWidth: '440px', padding: 'clamp(2rem, 6vw, 3rem) clamp(1.25rem, 5vw, 2rem)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>Admin Access</h2>
          <p style={{ marginTop: '0.5rem' }}>Log in to access the control panel</p>
        </div>

        <form
          className="contact-form"
          style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }}
          onSubmit={handleSubmit}
        >
          <label>
            Username
            <input
              type="text"
              autoComplete="username"
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p
              role="alert"
              style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                marginTop: '1rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            className="button button-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Auth;
