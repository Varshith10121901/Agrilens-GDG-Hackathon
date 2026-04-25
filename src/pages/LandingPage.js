import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' });
  const [isSignup, setIsSignup] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    login(formData);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--stone-50)' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <div className="navbar-logo">
          <div className="navbar-logo-icon gradient-primary">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.8 0 3.5-.5 5-1.3" strokeLinecap="round"/>
              <path d="M12 6c-2 2-3 5-2 8M14 4c1 3 1 6 0 9M8.5 7c3-1 6-.5 8 1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="navbar-brand">
            Agri<span>Lens</span>
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-grid">
          {/* Left: Copy */}
          <div>
            <div className="landing-tag">
              <span className="status-dot status-dot-green" />
              AI-Powered Crop Intelligence
            </div>
            <h1 className="landing-title">
              Smarter farming<br />
              <span>starts here.</span>
            </h1>
            <p className="landing-desc">
              Scan your crops, detect diseases instantly, get precise treatment
              plans, and plan irrigation with AI — all from your phone.
            </p>

            {/* Features */}
            <div className="landing-features">
              {[
                { title: 'Instant Disease Detection', desc: 'Upload a photo and get AI analysis in seconds' },
                { title: 'Personalized Crop Plans', desc: 'Irrigation, pesticide, and care schedules for your crop' },
                { title: 'Weather Intelligence', desc: '7-day forecast with smart farming recommendations' },
              ].map(f => (
                <div key={f.title} className="landing-feature">
                  <div className="landing-feature-check">
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: '0.75rem', height: '0.75rem', color: 'var(--forest-600)' }}>
                      <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="glass-card landing-form-card">
            <h2>{isSignup ? 'Get Started' : 'Welcome Back'}</h2>
            <p className="subtitle">
              {isSignup ? 'Create your farmer profile to begin' : 'Enter your name to continue'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="landing-form-group">
                <label htmlFor="farmer-name">Full Name *</label>
                <input
                  id="farmer-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="input-field"
                />
              </div>

              {isSignup && (
                <>
                  <div className="landing-form-group">
                    <label htmlFor="farmer-phone">Phone Number</label>
                    <input
                      id="farmer-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      placeholder="Optional"
                      className="input-field"
                    />
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="farmer-location">Village / Town</label>
                    <input
                      id="farmer-location"
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                      placeholder="Optional"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary w-full" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                {isSignup ? 'Create Profile' : 'Continue'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="landing-toggle"
            >
              {isSignup ? 'Already have a profile? Quick login' : 'New here? Create a profile'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          {[
            { value: '50+', label: 'Crop varieties supported' },
            { value: '95%', label: 'Disease detection accuracy' },
            { value: 'Free', label: 'Weather & irrigation data' },
            { value: 'Instant', label: 'AI-generated reports' },
          ].map(s => (
            <div key={s.label}>
              <p className="landing-stat-value">{s.value}</p>
              <p className="landing-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
