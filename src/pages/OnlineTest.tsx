import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginCard from '../components/LoginCard';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const OnlineTest: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="online-test-center container section">
        <p style={{ color: 'var(--text-secondary)' }}>{t.onlineTest.checkingSession}</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/online-test/session" replace />;
  }

  return (
    <main className="online-test-center container section">
      <LoginCard
        variant="card"
        eyebrow={t.onlineTest.eyebrow}
        title={t.onlineTest.loginTitle}
        description={t.authForm.loginDescription}
      />
    </main>
  );
};

export default OnlineTest;
