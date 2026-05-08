import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, ArrowRight, PlayCircle, Plane, Users, MessageCircle } from 'lucide-react';


const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('2024');

  return (
    <main id="home">
      <section className="hero container">
        <div className="hero-content reveal is-visible">
          <p className="eyebrow">Student Pilot</p>
          <h1>
            We Make Your Dream Come True.
          </h1>

          

          <ul className="hero-meta">
            <li><CheckCircle size={16} /> High Pass Rate</li>
            <li><CheckCircle size={16} /> Trusted by 100+ Students</li>
            <li><CheckCircle size={16} /> Guidance Throughout the Process</li>  
          </ul>

          <div className="hero-actions" style={{ marginTop: '2rem' }}>
            <a className="button button-secondary" href="#about">
              About Sully Academy
            </a>
          </div>
        </div>

        <div className="hero-image-wrapper reveal is-visible" style={{ "--delay": 1, position: 'relative' } as React.CSSProperties}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, var(--bg-primary) 120%)', zIndex: 1, borderRadius: 'var(--radius-lg)', pointerEvents: 'none' }}></div>
          <img 
            src="/hero_cockpit.png" 
            alt="Airplane cockpit at sunset" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--glass-shadow)', 
              border: '1px solid var(--glass-border)',
              display: 'block'
            }} 
          />
        </div>
      </section>

      <section id="about" className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">Why Choose Us</p>
          <h2>Built for Student Pilots</h2>
        </div>

        <div className="grid cards-3">
          <div className="card reveal is-visible" style={{ "--delay": 1 } as React.CSSProperties}>
            <Users color="var(--sky-500)" size={32} />
            <h3>Instructor-Led Learning</h3>
            <p>Learn directly from experienced commercial pilots and ground instructors who know exactly what you need to pass.</p>
          </div>

          <div className="card reveal is-visible" style={{ "--delay": 2 } as React.CSSProperties}>
            <BookOpen color="var(--sky-500)" size={32} />
            <h3>Structured Study</h3>
            <p>Follow a proven curriculum with structured modules, practice exams, and comprehensive study materials.</p>
          </div>

          <div className="card reveal is-visible" style={{ "--delay": 3 } as React.CSSProperties}>
            <Plane color="var(--sky-500)" size={32} />
            <h3>Thai Context</h3>
            <p>Lessons and examples specifically tailored for the aviation environment and regulations in Thailand.</p>
          </div>
        </div>
      </section>

      

      <section id="achievements" className="container section timeline reveal is-visible">
        <div className="section-head">
          <p className="eyebrow">Success Stories</p>
          <h2>Our Track Record</h2>
        </div>

        <div className="timeline-tabs">
          <button className={`timeline-tab ${activeTab === '2024' ? 'is-active' : ''}`} onClick={() => setActiveTab('2024')}>2024 Success</button>
          <button className={`timeline-tab ${activeTab === '2025' ? 'is-active' : ''}`} onClick={() => setActiveTab('2025')}>2025 Goals</button>
        </div>

        <div className="grid cards-2">
          <div className="selection-chart">
            <h3>Exam Pass Rates</h3>
            <p>First-time pass rate for our students</p>

            <div className="selection-chart-rows">
              <div className="selection-chart-row">
                <div className="selection-chart-head">
                  <span>PPL Written</span>
                  <strong>96%</strong>
                </div>
                <div className="selection-chart-track">
                  <div className="selection-chart-fill year-2024" style={{ "--fill": "96%" } as React.CSSProperties}></div>
                </div>
              </div>
              <div className="selection-chart-row">
                <div className="selection-chart-head">
                  <span>CPL Written</span>
                  <strong>89%</strong>
                </div>
                <div className="selection-chart-track">
                  <div className="selection-chart-fill year-2024" style={{ "--fill": "89%" } as React.CSSProperties}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="quote-card">
            <Award size={40} color="var(--sun-500)" style={{ marginBottom: '1rem' }} />
            <p><em>"Sully Academy transformed my ground school experience. I was struggling with Navigation, but their simplified approach made it click instantly. I passed my exam with a 92%!"</em></p>
            <h3>— Student Pilot N. Srisuwan</h3>
          </div>
        </div>
      </section>


      <section id="news" className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">Updates</p>
          <h2>Latest News</h2>
        </div>

        <div className="scroll-grid">
          <div className="card reveal is-visible" style={{ padding: 0, overflow: 'hidden' }}>
            <img src="/tg_crew.png" alt="THAI Airways Crew Recruitment" style={{ width: '100%', height: '250px', objectFit: 'cover', borderBottom: '1px solid var(--glass-border)' }} />
            <div style={{ padding: '1.5rem 2rem' }}>
              <span className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>Student Pilot</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thai Airways Student Pilot 2026</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>FLY FOR THE NEW PRIDE. We are ready to fly to the farther future together. Explore recruitment opportunities with Thai Airways.</p>
              <a href="https://career.thaiairways.com/student-pilot-recruitment-2026/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>Read More <ArrowRight size={16} /></a>
            </div>
          </div>

          <div className="card reveal is-visible" style={{ padding: 0, overflow: 'hidden', "--delay": 1 } as React.CSSProperties}>
            <img src="/vz_crew.png" alt="Vietjet Air Student Pilot Recruitment" style={{ width: '100%', height: '250px', objectFit: 'cover', borderBottom: '1px solid var(--glass-border)' }} />
            <div style={{ padding: '1.5rem 2rem' }}>
              <span className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>Career Opportunity</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thai Vietjet Student Pilot 2025</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>ROAD TO SKY JOURNEY 2025. Student Pilot Recruitment program is now open. Join Vietjet Thailand and start your aviation journey.</p>
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>Read More <ArrowRight size={16} /></a>
            </div>
          </div>

          <div className="card reveal is-visible" style={{ padding: 0, overflow: 'hidden', "--delay": 2 } as React.CSSProperties}>
            <img src="/tg_crew.png" alt="THAI Airways Updates" style={{ width: '100%', height: '250px', objectFit: 'cover', borderBottom: '1px solid var(--glass-border)' }} />
            <div style={{ padding: '1.5rem 2rem' }}>
              <span className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>Update</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thai Airways Cadet Program</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Prepare for your future with the nation's leading carrier. Discover comprehensive training programs designed for upcoming aviation professionals.</p>
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>Read More <ArrowRight size={16} /></a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="container contact-shell">
          <div className="reveal is-visible">
            <p className="eyebrow">Get In Touch</p>
            <h2>Have questions?</h2>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Not sure which course is right for you? Send us a message and our instructors will help guide your training path.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MessageCircle size={24} color="var(--sky-500)" />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Line Official</strong>
                <br />
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 'bold' }}>@sullyacademy</a>
              </div>
            </div>
          </div>

          <form className="contact-form reveal is-visible" style={{ "--delay": 1 } as React.CSSProperties}>
            <label>
              Name
              <input type="text" placeholder="Jane Doe" required />
            </label>
            <label>
              Email
              <input type="email" placeholder="jane@example.com" required />
            </label>
            <label>
              Message
              <textarea rows={4} placeholder="How can we help?" style={{
                resize: 'vertical'
              }} required></textarea>
            </label>
            <button className="button button-primary" style={{ marginTop: '0.5rem' }}>
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Home;
