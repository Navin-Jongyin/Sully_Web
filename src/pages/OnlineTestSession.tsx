import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Plane,
  Award,
  Radio,
  ArrowRight,
  LogOut,
  LayoutGrid,
  Clock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import {
  ONLINE_TEST_CATEGORIES,
  formatTimeLimit,
  resolveTimeLimitMinutes,
  type OnlineTestCategory,
  type OnlineTestRecord,
} from '../online-test/types';
import { OnlineTestPlayer } from '../online-test/OnlineTestPlayer';
import { normalizeTestEmail, recordTestAttemptStart } from '../lib/online-test-attempts';

const CATEGORY_META: Record<
  OnlineTestCategory,
  { icon: typeof Plane; accent: string; tint: string }
> = {
  'Student Pilot': {
    icon: Plane,
    accent: 'var(--accent-blue)',
    tint: 'rgba(37, 99, 235, 0.1)',
  },
  'Qualified Pilot': {
    icon: Award,
    accent: 'var(--accent-purple)',
    tint: 'rgba(124, 58, 237, 0.1)',
  },
  ATC: {
    icon: Radio,
    accent: 'var(--sky-500)',
    tint: 'rgba(14, 165, 233, 0.1)',
  },
};

const OnlineTestSession: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOutGoogle } = useAuth();
  const { onlineTests } = useData();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [selected, setSelected] = useState<string>('all');
  const [activeTest, setActiveTest] = useState<OnlineTestRecord | null>(null);
  const [attempts, setAttempts] = useState<Record<string, boolean>>({});
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    const normalizedEmail = normalizeTestEmail(user.email);
    const unsub = onSnapshot(
      query(collection(db, 'onlineTestAttempts'), where('email', '==', normalizedEmail)),
      (snap) => {
        const att: Record<string, boolean> = {};
        snap.forEach((d) => {
          att[d.data().testId] = true;
        });
        setAttempts(att);
      },
    );
    return () => unsub();
  }, [user?.email]);

  const handleStartTest = async (test: OnlineTestRecord) => {
    if (!user?.email || attempts[test.id] || startingTestId) return;

    setStartingTestId(test.id);
    try {
      await recordTestAttemptStart(user.email, test.id, user.uid);
      setActiveTest(test);
    } catch (err) {
      if (err instanceof Error && err.message === 'attempt-already-exists') {
        setAttempts((prev) => ({ ...prev, [test.id]: true }));
        alert(t.onlineTest.testAlreadyTaken);
      } else {
        alert(t.onlineTest.startFailed);
      }
    } finally {
      setStartingTestId(null);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutGoogle();
      navigate('/online-test', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (!user) return null;

  if (activeTest) {
    return (
      <OnlineTestPlayer
        test={activeTest}
        onExit={() => setActiveTest(null)}
      />
    );
  }

  const firstName = (user.displayName ?? user.email ?? 'Pilot').split(' ')[0];

  const categories = ONLINE_TEST_CATEGORIES.map((id) => ({
    id,
    icon: CATEGORY_META[id].icon,
    title:
      id === 'Student Pilot'
        ? t.onlineTest.catStudentPilotTitle
        : id === 'Qualified Pilot'
          ? t.onlineTest.catQualifiedPilotTitle
          : t.onlineTest.catAtcTitle,
    desc:
      id === 'Student Pilot'
        ? t.onlineTest.catStudentPilotDesc
        : id === 'Qualified Pilot'
          ? t.onlineTest.catQualifiedPilotDesc
          : t.onlineTest.catAtcDesc,
    accent: CATEGORY_META[id].accent,
    tint: CATEGORY_META[id].tint,
  }));

  const navItems = [
    { id: 'all', icon: LayoutGrid, label: t.onlineTest.allCategories, accent: 'var(--text-primary)' },
    ...categories.map((cat) => ({
      id: cat.id,
      icon: cat.icon,
      label: cat.title,
      accent: cat.accent,
    })),
  ];

  const visibleTests =
    selected === 'all'
      ? onlineTests
      : onlineTests.filter((test) => test.category === selected);

  const selectedCategory = categories.find((cat) => cat.id === selected);

  return (
    <div className="ot-session">
      <header className="ot-session-header">
        <div className="ot-header-container">
          <div className="ot-session-brand">
            <span className="ot-session-logo">Sully Academy</span>
            <span className="ot-session-divider" aria-hidden="true" />
            <span className="ot-session-tag">{t.onlineTest.title}</span>
          </div>

          <div className="ot-account">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName ?? 'Profile'} referrerPolicy="no-referrer" />
            ) : (
              <div className="ot-account-avatar">
                {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ot-account-meta">
              <strong>{user.displayName ?? 'User'}</strong>
              <span>{user.email}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="ot-signout"
              title={t.onlineTest.signOut}
            >
              <LogOut size={16} />
              <span>{signingOut ? t.onlineTest.signingOut : t.onlineTest.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="ot-session-container">
        <nav className="ot-sidebar" aria-label={t.onlineTest.testCategoriesAria}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`ot-sidebar-item${isActive ? ' is-active' : ''}`}
              onClick={() => setSelected(item.id)}
              aria-current={isActive}
              style={isActive ? { color: item.accent } : undefined}
            >
              <span className="ot-sidebar-icon">
                <Icon size={20} />
              </span>
              <span className="ot-sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="ot-session-main">
        <section className="ot-welcome">
          <p className="eyebrow">{t.onlineTest.eyebrow}</p>
          <h1>{t.onlineTest.welcomeBack.replace('{name}', firstName)}</h1>
          <p className="ot-welcome-sub">
            {selected === 'all'
              ? t.onlineTest.dashboardSubtitle
              : selectedCategory?.desc ?? t.onlineTest.dashboardSubtitle}
          </p>
        </section>

        <section className="ot-grid">
          {visibleTests.length === 0 ? (
            <div className="ot-empty">
              <p>{t.onlineTest.noTestsInCategory}</p>
            </div>
          ) : (
            visibleTests.map((test) => {
              const meta =
                test.category in CATEGORY_META
                  ? CATEGORY_META[test.category as OnlineTestCategory]
                  : CATEGORY_META['Student Pilot'];
              const Icon = meta.icon;
              return (
                <article key={test.id} className="ot-card">
                  <span className="ot-card-icon" style={{ background: meta.tint, color: meta.accent }}>
                    <Icon size={24} />
                  </span>
                  <span className="ot-card-category">{test.category}</span>
                  <h3>{test.title}</h3>
                  {test.description && <p>{test.description}</p>}
                  <div className="ot-card-meta">
                    <Clock size={14} />
                    <span>{formatTimeLimit(resolveTimeLimitMinutes(test))}</span>
                  </div>
                  <button
                    type="button"
                    className="ot-card-cta"
                    onClick={() => handleStartTest(test)}
                    disabled={attempts[test.id] || startingTestId === test.id}
                    style={{
                      background: attempts[test.id] ? 'var(--surface-muted)' : meta.accent,
                      borderColor: attempts[test.id] ? 'var(--glass-border)' : meta.accent,
                      color: attempts[test.id] ? 'var(--text-secondary)' : 'white',
                      cursor: attempts[test.id] ? 'not-allowed' : 'pointer',
                      boxShadow: attempts[test.id] ? 'none' : undefined,
                    }}
                  >
                    {attempts[test.id]
                      ? t.onlineTest.testCompleted
                      : startingTestId === test.id
                        ? t.onlineTest.startingTest
                        : t.onlineTest.startButton}
                    {!attempts[test.id] && startingTestId !== test.id && <ArrowRight size={16} />}
                  </button>
                </article>
              );
            })
          )}
        </section>
        </main>
      </div>
    </div>
  );
};

export default OnlineTestSession;
