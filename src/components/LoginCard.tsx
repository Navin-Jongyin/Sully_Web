import React, { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

function getAuthFormErrorMessage(err: unknown, t: ReturnType<typeof useTranslation>['t']): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-email':
        return t.authForm.invalidEmail;
      case 'auth/user-disabled':
        return t.authForm.userDisabled;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return t.authForm.invalidCredentials;
      case 'auth/email-already-in-use':
        return t.authForm.emailInUse;
      case 'auth/weak-password':
        return t.authForm.weakPassword;
      case 'auth/too-many-requests':
        return t.authForm.tooManyRequests;
      case 'auth/popup-closed-by-user':
        return t.authForm.popupClosed;
      case 'auth/network-request-failed':
        return t.authForm.networkError;
      default:
        return err.message;
    }
  }
  if (err instanceof Error) return err.message;
  return t.authForm.genericError;
}

interface LoginCardProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Compact card for embedded pages (e.g. online test). Full layout uses page shell. */
  variant?: 'page' | 'card';
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginCard: React.FC<LoginCardProps> = ({
  eyebrow,
  title,
  description,
  variant = 'card',
}) => {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(getAuthFormErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getAuthFormErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`login-panel${variant === 'page' ? ' login-panel--page' : ''}`}>
      <div className="login-panel-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="login-panel-desc">{description}</p>
      </div>

      <div className="login-mode-toggle" role="tablist" aria-label="Auth mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={mode === 'signin' ? 'is-active' : ''}
          onClick={() => { setMode('signin'); setError(null); }}
        >
          {t.authForm.signIn}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'is-active' : ''}
          onClick={() => { setMode('signup'); setError(null); }}
        >
          {t.authForm.createAccount}
        </button>
      </div>

      <form className="login-form" onSubmit={handleEmailSubmit}>
        <label className="login-field">
          <span>{t.authForm.email}</span>
          <div className="login-input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </label>

        <label className="login-field">
          <span>{t.authForm.password}</span>
          <div className="login-input-wrap">
            <Lock size={18} aria-hidden="true" />
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </label>

        {error && (
          <p role="alert" className="login-error">
            {error}
          </p>
        )}

        <button type="submit" className="button button-primary login-submit" disabled={submitting}>
          <span>
            {submitting
              ? t.authForm.pleaseWait
              : mode === 'signin'
                ? t.authForm.signIn
                : t.authForm.createAccount}
          </span>
          {!submitting && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="login-divider">
        <span>{t.authForm.or}</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="login-google-btn"
      >
        <GoogleIcon />
        {t.onlineTest.signInWithGoogle}
      </button>
    </div>
  );
};

export default LoginCard;
