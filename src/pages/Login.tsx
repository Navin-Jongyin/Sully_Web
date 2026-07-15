import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Plane } from 'lucide-react';
import LoginCard from '../components/LoginCard';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

interface LocationState {
  from?: { pathname?: string };
}

const Login: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname || '/dashboard';

  if (loading) {
    return (
      <main className="login-page">
        <div className="login-page-loading">
          <p>{t.common.loading}</p>
        </div>
      </main>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <main className="login-page">
      <section className="login-brand" aria-hidden="false">
        <div className="login-brand-media">
          <img
            src="/hero_cockpit.png"
            alt=""
            decoding="async"
          />
        </div>
        <div className="login-brand-overlay" />
        <div className="login-brand-content">
          <Link to="/" className="login-brand-logo">
            <Plane size={22} />
            <span>Sully Academy</span>
          </Link>
          <p className="eyebrow">{t.authForm.welcomeEyebrow}</p>
          <h2>{t.authForm.welcomeTitle}</h2>
          <p>{t.authForm.welcomeDesc}</p>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-lang-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={language === 'en' ? 'is-active' : ''}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={language === 'th' ? 'is-active' : ''}
            onClick={() => setLanguage('th')}
          >
            TH
          </button>
        </div>
        <LoginCard
          variant="page"
          eyebrow={t.common.login}
          title={t.commerce.accountLoginTitle}
          description={t.authForm.loginDescription}
        />
      </section>
    </main>
  );
};

export default Login;
