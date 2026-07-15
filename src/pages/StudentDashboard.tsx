import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Play,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { formatThb } from '../lib/payments';
import { subscribeCourseEntitlements, subscribeUserPurchases } from '../lib/purchases';
import type { PurchaseRecord } from '../commerce/types';
import './StudentDashboard.css';

type DashSection = 'overview' | 'courses' | 'profile';

const StudentDashboard: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user, loading, signOutGoogle } = useAuth();
  const { onlineVideoCourses, merchandise } = useData();
  const navigate = useNavigate();
  const [section, setSection] = useState<DashSection>('overview');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState<string[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubPurchases = subscribeUserPurchases(user.uid, setPurchases);
    const unsubEntitlements = subscribeCourseEntitlements(user.uid, setOwnedCourseIds);
    return () => {
      unsubPurchases();
      unsubEntitlements();
    };
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutGoogle();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/dashboard' } }} replace />;
  }

  const firstName = (user.displayName ?? user.email ?? t.dashboard.studentFallback).split(/[\s@]/)[0];
  const ownedCourses = onlineVideoCourses.filter((c) => ownedCourseIds.includes(c.id));
  const paidOrders = purchases.filter((p) => p.status === 'paid');
  const featuredMerch = merchandise.filter((m) => m.inStock).slice(0, 3);

  const navItems: { id: DashSection; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: t.dashboard.overview },
    { id: 'courses', icon: BookOpen, label: t.dashboard.myCourses },
    { id: 'profile', icon: UserRound, label: t.dashboard.profile },
  ];

  return (
    <div className="sd-shell">
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <GraduationCap size={22} />
          <div>
            <strong>Sully Academy</strong>
            <span>{t.dashboard.studentPortal}</span>
          </div>
        </div>

        <nav className="sd-nav" aria-label={t.dashboard.navAria}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? 'is-active' : ''}
                onClick={() => setSection(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-lang-toggle" role="group" aria-label="Language">
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
          <Link to="/" className="sd-sidebar-link">
            <Home size={16} />
            {t.dashboard.backToSite}
          </Link>
          <button type="button" className="sd-sidebar-link sd-signout" onClick={handleSignOut} disabled={signingOut}>
            <LogOut size={16} />
            {signingOut ? t.onlineTest.signingOut : t.onlineTest.signOut}
          </button>
        </div>
      </aside>

      <div className="sd-main">
        <header className="sd-topbar">
          <div>
            <p className="eyebrow">{t.dashboard.eyebrow}</p>
            <h1>
              {section === 'overview' && t.dashboard.welcome.replace('{name}', firstName)}
              {section === 'courses' && t.dashboard.myCourses}
              {section === 'profile' && t.dashboard.profile}
            </h1>
          </div>
          <div className="sd-user-chip">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <div className="sd-user-fallback">{firstName.charAt(0).toUpperCase()}</div>
            )}
            <div className="sd-user-meta">
              <strong>{user.displayName ?? firstName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>

        <div className="sd-content">
          {section === 'overview' && (
            <>
              <div className="sd-stats">
                <div className="sd-stat">
                  <span>{t.dashboard.statCourses}</span>
                  <strong>{ownedCourses.length}</strong>
                </div>
                <div className="sd-stat">
                  <span>{t.dashboard.statOrders}</span>
                  <strong>{paidOrders.length}</strong>
                </div>
                <div className="sd-stat">
                  <span>{t.dashboard.statShop}</span>
                  <strong>{merchandise.filter((m) => m.inStock).length}</strong>
                </div>
              </div>

              <div className="sd-quick">
                <Link to="/online-courses" className="sd-quick-card">
                  <BookOpen size={22} />
                  <div>
                    <strong>{t.commerce.onlineCoursesTitle}</strong>
                    <span>{t.dashboard.browseCoursesHint}</span>
                  </div>
                </Link>
                <Link to="/shop" className="sd-quick-card">
                  <ShoppingBag size={22} />
                  <div>
                    <strong>{t.commerce.shopTitle}</strong>
                    <span>{t.dashboard.browseShopHint}</span>
                  </div>
                </Link>
              </div>

              <section className="sd-panel">
                <div className="sd-panel-head">
                  <h2>{t.dashboard.continueLearning}</h2>
                  <button type="button" className="sd-text-btn" onClick={() => setSection('courses')}>
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {ownedCourses.length === 0 ? (
                  <div className="sd-empty">
                    <BookOpen size={32} />
                    <p>{t.commerce.noOwnedCourses}</p>
                    <Link to="/online-courses" className="button button-primary">
                      {t.commerce.browseCourses}
                    </Link>
                  </div>
                ) : (
                  <div className="sd-course-grid">
                    {ownedCourses.slice(0, 3).map((course) => (
                      <article key={course.id} className="sd-course-card">
                        <div className="sd-course-thumb">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt="" />
                          ) : (
                            <BookOpen size={28} />
                          )}
                        </div>
                        <div className="sd-course-body">
                          <span>{course.category}</span>
                          <h3>{course.title}</h3>
                          <p>
                            {course.lessons.length} {t.commerce.lessons}
                          </p>
                          <Link to={`/online-courses/${course.id}`} className="button button-primary">
                            <Play size={14} /> {t.commerce.watch}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {featuredMerch.length > 0 && (
                <section className="sd-panel">
                  <div className="sd-panel-head">
                    <h2>{t.dashboard.fromShop}</h2>
                    <Link to="/shop" className="sd-text-btn">
                      {t.dashboard.viewAll}
                    </Link>
                  </div>
                  <div className="sd-merch-row">
                    {featuredMerch.map((item) => (
                      <Link key={item.id} to="/shop" className="sd-merch-card">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <ShoppingBag size={24} />}
                        <strong>{item.name}</strong>
                        <span>{formatThb(item.priceThb)}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {section === 'courses' && (
            <section className="sd-panel">
              {ownedCourses.length === 0 ? (
                <div className="sd-empty">
                  <BookOpen size={32} />
                  <p>{t.commerce.noOwnedCourses}</p>
                  <Link to="/online-courses" className="button button-primary">
                    {t.commerce.browseCourses}
                  </Link>
                </div>
              ) : (
                <div className="sd-course-grid">
                  {ownedCourses.map((course) => (
                    <article key={course.id} className="sd-course-card">
                      <div className="sd-course-thumb">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt="" />
                        ) : (
                          <BookOpen size={28} />
                        )}
                      </div>
                      <div className="sd-course-body">
                        <span>{course.category}</span>
                        <h3>{course.title}</h3>
                        <p>
                          {course.lessons.length} {t.commerce.lessons}
                        </p>
                        <Link to={`/online-courses/${course.id}`} className="button button-primary">
                          <Play size={14} /> {t.commerce.watch}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {section === 'profile' && (
            <section className="sd-panel sd-profile">
              <div className="sd-profile-card">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <div className="sd-profile-avatar">{firstName.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <h2>{user.displayName ?? firstName}</h2>
                  <p>{user.email}</p>
                  <p className="sd-profile-note">{t.dashboard.profileNote}</p>
                </div>
              </div>
              <button type="button" className="button button-secondary" onClick={handleSignOut} disabled={signingOut}>
                <LogOut size={16} />
                {signingOut ? t.onlineTest.signingOut : t.onlineTest.signOut}
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
