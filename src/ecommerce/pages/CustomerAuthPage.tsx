import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';

export function CustomerAuthPage() {
  const { signIn, signUp, signInGoogle } = useEcommerceAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/account';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container section shop-page">
      <div className="shop-auth-card card">
        <h1>{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
        <p className="hint">Access your courses, orders, and checkout.</p>

        <form onSubmit={handleSubmit} className="shop-form">
          {mode === 'signup' && (
            <label>
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </label>
          {error && <p className="shop-error">{error}</p>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {mode === 'signup' ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <button type="button" className="button button-secondary shop-google-btn" onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </button>

        <p className="shop-auth-toggle">
          {mode === 'signup' ? (
            <>Already have an account? <button type="button" onClick={() => setMode('signin')}>Sign in</button></>
          ) : (
            <>New here? <button type="button" onClick={() => setMode('signup')}>Create account</button></>
          )}
        </p>
        <Link to="/shop" className="shop-back-link">← Back to shop</Link>
      </div>
    </main>
  );
}
