import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, ArrowRight, PlayCircle, Plane, Check, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

          <p className="hero-copy">
            Sully Academy provides premier tutoring for student pilots in Thailand. We break down complex aviation topics into easy-to-understand lessons, tailored specifically for your success.
          </p>

          <ul className="hero-meta">
            <li><CheckCircle size={16} /> High Pass Rate</li>
            <li><CheckCircle size={16} /> Trusted by 100+ Students</li>
            <li><CheckCircle size={16} /> Guidance Throughout the Process</li>  
          </ul>

          <div className="hero-actions" style={{ marginTop: '2rem' }}>
            <a className="button button-primary" href="#courses">
              <PlayCircle size={18} /> Explore Courses
            </a>
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

      <section id="courses" className="container section">
        <div className="section-head reveal is-visible">
          <p className="eyebrow">Our Curriculum</p>
          <h2>Featured Courses</h2>
        </div>

        <div className="course-shell">
          <div className="video-card reveal is-visible">
            <div className="video-frame">
              <iframe
                src="https://www.youtube.com/embed/1AMbMS_D6WI"
                title="Sully Academy Preview"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="card reveal is-visible" style={{ "--delay": 1 } as React.CSSProperties}>
            <h3>Private Pilot (PPL) Ground School Prep</h3>
            <p>The complete path to passing your PPL written exam on the first try. Covers all 9 subjects required by CAAT.</p>
            <ul className="course-list">
              <li>Air Law & ATC Procedures</li>
              <li>Aircraft General Knowledge</li>
              <li>Flight Performance & Planning</li>
              <li>Human Performance & Limitations</li>
              <li>Meteorology</li>
              <li>Navigation</li>
            </ul>
            <div style={{ marginTop: '1.5rem' }}>
              <Link className="button button-primary" to="/auth">Enroll Now <ArrowRight size={16} /></Link>
            </div>
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

      <section id="pricing" className="container section">
         <div className="section-head reveal is-visible">
          <p className="eyebrow">Enrollment</p>
          <h2>Simple Pricing</h2>
        </div>

        <div className="grid pricing-grid cards-2">
          <div className="pricing-card reveal is-visible">
            <h3>Self-Paced Plan</h3>
            <p>For independent learners.</p>
            <p className="price">฿4,900 <span>/ course</span></p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> 12-month access to video lessons</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> Practice question bank</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> Downloadable study notes</li>
            </ul>
            <Link className="button button-secondary" style={{ marginTop: 'auto' }} to="/auth">Get Started</Link>
          </div>

          <div className="pricing-card featured reveal is-visible" style={{ "--delay": 1 } as React.CSSProperties}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Premium Bootcamp</h3>
              <span className="tag">Most Popular</span>
            </div>
            <p>For guaranteed results with guidance.</p>
            <p className="price">฿12,900 <span>/ course</span></p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> Everything in Self-Paced</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> Live weekly group tutoring</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> 3 hours of 1-on-1 coaching</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}><Check size={16} color="var(--sky-500)" /> Mock exam review sessions</li>
            </ul>
            <Link className="button button-primary" style={{ marginTop: 'auto' }} to="/auth">Join Waitlist</Link>
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
