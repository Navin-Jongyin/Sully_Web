import React, { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { auth } from '../firebase';

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
  const { t, language } = useTranslation();
  const { signInWithGoogle, signOutGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gmailOnly = language === 'th' ? 'ใช้บัญชี Gmail เท่านั้น' : 'Use a Gmail account only.';

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      const email = auth.currentUser?.email ?? '';
      if (!/@gmail\.com$/i.test(email) && !/@googlemail\.com$/i.test(email)) {
        await signOutGoogle();
        setError(gmailOnly);
      }
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

      {error && <p role="alert" className="login-error">{error}</p>}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="login-google-btn"
      >
        <GoogleIcon />
        {submitting ? t.authForm.pleaseWait : (language === 'th' ? 'เข้าสู่ระบบด้วย Gmail' : 'Continue with Gmail')}
      </button>
      <p className="login-panel-desc" style={{ marginTop: '0.85rem' }}>{gmailOnly}</p>
    </div>
  );
};

export default LoginCard;
