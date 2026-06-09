import React, { useState } from 'react';
import { BookOpen, Award, ArrowRight, Plane, Users, MessageCircle } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';


const Home: React.FC = () => {
  const { news, trackRecord, studentMessages, homeLoading } = useData();
  const { t } = useTranslation();
  const publishedNews = news.filter(n => n.status === 'Published').slice(0, 3);
  const [requestedTab, setRequestedTab] = useState('2024');

  if (homeLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{t.common.loading}</div>;
  }

  // Derive effective tab from state + data — no effect needed.
  const years = Object.keys(trackRecord);
  const activeTab = trackRecord[requestedTab] ? requestedTab : (years[0] ?? requestedTab);
  const setActiveTab = setRequestedTab;
  const currentYearData = trackRecord[activeTab] || { stats: [], testimonial: { quote: '', author: '' } };

  return (
    <main>
      <section className="hero container" id='home'>
        <div className="hero-content reveal is-visible">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.heroTitle}</h1>
          <p className="hero-description">
            {t.home.heroDescription}
          </p>
          <div className="hero-actions">
            <a href="https://interview-booking.netlify.app/" target="_blank" rel="noopener noreferrer" className="button button-primary">{t.home.bookInterview}</a>
            <a href="https://sully-test.com" target="_blank" rel="noopener noreferrer" className="button button-purple">{t.home.aptitudePractice}</a>
            <a href="#contact" className="button button-gold">{t.home.contactUs}</a>
          </div>
        </div>
        <div className="hero-image reveal is-visible" style={{ "--delay": 2 } as React.CSSProperties}>
          <img
            src="/hero_cockpit.png"
            alt="Modern Cockpit"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={800}
          />
        </div>
      </section>

      <section id="stats" className="container reveal is-visible">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">{t.home.studentsPassed}</span>
          </div>
         
          <div className="stat-item">
            <span className="stat-number">2017</span>
            <span className="stat-label">{t.home.estSince}</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">{t.home.studentVoiceEyebrow}</p>
          <h2>{t.home.studentVoiceTitle}</h2>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            {t.home.studentVoiceDesc}
          </p>
        </div>

        <div className="scroll-grid">
          {studentMessages.map((msg, i) => (
            <div key={msg.id} className="card reveal is-visible" style={{ "--delay": i + 1, display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(msg.rating)].map((_, starI) => (
                  <Award key={starI} size={16} color="var(--accent-gold)" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1.5rem', flex: 1 }}>
                "{msg.message}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: i % 2 === 0 ? 'var(--accent-blue)' : 'var(--accent-purple)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {msg.name.charAt(0)}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>{msg.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{msg.position}</span>
                </div>
              </div>
            </div>
          ))}
          {studentMessages.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>{t.home.noMessages}</p>
          )}
        </div>
      </section>

      <section id="about" className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">{t.home.whyChooseUsEyebrow}</p>
          <h2>{t.home.whyChooseUsTitle}</h2>
        </div>

        <div className="grid cards-3">
          <div className="card reveal is-visible" style={{ "--delay": 1 } as React.CSSProperties}>
            <Users color="var(--sky-500)" size={32} />
            <h3>{t.home.supportiveLearning}</h3>
            <p>{t.home.supportiveLearningDesc}</p>
          </div>

          <div className="card reveal is-visible" style={{ "--delay": 2 } as React.CSSProperties}>
            <BookOpen color="var(--sky-500)" size={32} />
            <h3>{t.home.openCommunity}</h3>
            <p>{t.home.openCommunityDesc}</p>
          </div>

          <div className="card reveal is-visible" style={{ "--delay": 3 } as React.CSSProperties}>
            <Plane color="var(--sky-500)" size={32} />
            <h3>{t.home.tailoredExpertise}</h3>
            <p>{t.home.tailoredExpertiseDesc}</p>
          </div>
        </div>
      </section>

      

      <section id="achievements" className="container section timeline reveal is-visible">
        <div className="section-head">
          <p className="eyebrow">{t.home.successStoriesEyebrow}</p>
          <h2>{t.home.successStoriesTitle}</h2>
        </div>

        <div className="timeline-tabs" style={{ marginBottom: '2rem' }}>
          {Object.keys(trackRecord).map(year => (
            <button 
              key={year}
              className={`timeline-tab ${activeTab === year ? 'is-active' : ''}`} 
              onClick={() => setActiveTab(year)}
            >
              {t.home.yearResults.replace('{year}', year)}
            </button>
          ))}
        </div>

        <div style={{ margin: '0 auto' }}>
          <div className="stats-container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t.home.examPerformance}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t.home.successMetrics} {activeTab}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {currentYearData.stats.map((stat, i) => (
                <div key={i} className="card stat-card reveal is-visible" style={{ "--delay": i, padding: '2rem', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' } as React.CSSProperties}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-blue)', fontWeight: 800 }}>{stat.value}</h3>
                </div>
              ))}
              {currentYearData.stats.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px dashed var(--glass-border)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t.home.noDataRecorded}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">{t.home.latestUpdatesEyebrow}</p>
          <h2>{t.home.latestUpdatesTitle}</h2>
        </div>

        <div className="grid cards-3" style={{ marginTop: '3rem' }}>
          {publishedNews.map((article, i) => (
            <div key={i} className="card news-card reveal is-visible" style={{ "--delay": i + 1, display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
              <div className="news-image">
                <img src={article.image} alt={article.title} loading="lazy" decoding="async" />
                <span className="news-tag">{article.tag}</span>
              </div>
              <div className="news-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="news-meta">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{article.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{article.description}</p>
                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginTop: 'auto' }}>{t.home.readMore} <ArrowRight size={16} /></a>
              </div>
            </div>
          ))}
          {publishedNews.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t.home.noNewsUpdates}</p>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div className="reveal is-visible">
            <p className="eyebrow">{t.home.getInTouchEyebrow}</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>
              {t.home.getInTouchTitle}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
              {t.home.getInTouchDesc}
            </p>

            <a
              href="https://line.me/R/ti/p/@sully2017"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: 'clamp(0.875rem, 2.5vw, 1.25rem) clamp(1.25rem, 4vw, 2.5rem)',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                borderRadius: 'var(--radius-full)',
                background: '#06C755',
                border: 'none',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={20} /> {t.home.addLine}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
