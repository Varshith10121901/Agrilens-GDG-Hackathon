import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWeatherForecast, getWeatherDescription, getCurrentSeason, getLocation } from '../services/weatherApi';
import { getAgricultureNews } from '../services/newsApi';
import NewsCarousel from '../components/NewsCarousel';
import NewsCard from '../components/NewsCard';
import { SkeletonNews } from '../components/Skeletons';

const farmingTips = [
  "Water early morning to reduce evaporation losses by up to 25%.",
  "Rotate crops each season to maintain soil health and reduce pest buildup.",
  "Test your soil pH every season — most crops prefer 6.0-7.0.",
  "Mulch around plants to retain moisture and suppress weeds naturally.",
  "Plant companion crops like marigolds to naturally repel harmful insects.",
  "Apply neem oil spray weekly as a preventive organic pest measure.",
  "Prune dead leaves regularly to improve air circulation and prevent fungal diseases.",
  "Add compost to improve soil structure and provide slow-release nutrients.",
];

export default function HomePage() {
  const { farmer } = useAuth();
  const [weather, setWeather] = useState(null);
  const [season, setSeason] = useState('');
  const [tipOfDay, setTipOfDay] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const currentCrop = farmer?.currentCrop;

  useEffect(() => {
    const dayIndex = new Date().getDate() % farmingTips.length;
    setTipOfDay(farmingTips[dayIndex]);

    getLocation()
      .then(({ latitude, longitude }) => {
        setSeason(getCurrentSeason(latitude));
        return getWeatherForecast(latitude, longitude);
      })
      .then(data => setWeather(data))
      .catch(() => setSeason(getCurrentSeason(20)))
      .finally(() => setLoadingWeather(false));

    // Fetch news for the grid below carousel
    getAgricultureNews()
      .then(articles => {
        setNewsArticles(articles || []);
      })
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, []);

  const currentWeather = weather?.current;
  const weatherInfo = currentWeather
    ? getWeatherDescription(currentWeather.weathercode)
    : null;

  return (
    <div className="page-transition page-bottom-padding">
      {/* Personalized Greeting */}
      <section className="mb-6 home-greeting">
        <h1>Welcome back, {farmer?.name?.split(' ')[0] || 'Farmer'}</h1>
        <p>Here's your farm overview for today</p>
      </section>

      {/* News Carousel */}
      <section className="mb-6">
        <NewsCarousel />
      </section>

      {/* My Crop Summary */}
      {currentCrop && (
        <section className="mb-6">
          <Link to="/my-crop" style={{ display: 'block' }}>
            <div className="glass-card glass-card-hover current-crop-card">
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--stone-500)', marginBottom: '0.25rem' }}>Current Crop</p>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--stone-800)' }}>{currentCrop.name}</h3>
                {currentCrop.lastScan && (
                  <div className="current-crop-status-row">
                    <span className={`status-dot ${
                      currentCrop.lastScan.urgency_level?.toLowerCase() === 'act now' ? 'status-dot-red' :
                      currentCrop.lastScan.urgency_level?.toLowerCase() === 'monitor' ? 'status-dot-yellow' : 'status-dot-green'
                    }`} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--stone-500)' }}>
                      {currentCrop.lastScan.disease_detected === 'Healthy' ? 'Healthy' : currentCrop.lastScan.disease_detected}
                    </span>
                  </div>
                )}
              </div>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--stone-400)' }} stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </section>
      )}

      {/* Quick Stats Strip */}
      <section className="stats-grid mb-8">
        {/* Weather */}
        <div className="glass-card glass-card-hover stat-card">
          {loadingWeather ? (
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: '1rem', width: '66%', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: '1.5rem', width: '50%' }} />
            </div>
          ) : weatherInfo ? (
            <>
              <div className="stat-icon" style={{ background: 'var(--info-50)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--info-500)' }} stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="stat-label">Today's Weather</p>
                <p className="stat-value">{Math.round(currentWeather.temperature_2m)}°C</p>
                <p className="stat-desc">{weatherInfo.text}</p>
              </div>
            </>
          ) : (
            <>
              <div className="stat-icon" style={{ background: 'var(--stone-100)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--stone-400)' }} stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="stat-label">Weather</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--stone-600)' }}>Enable location</p>
              </div>
            </>
          )}
        </div>

        {/* Season */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="stat-icon" style={{ background: 'var(--forest-50)' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--forest-500)' }} stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.8 0 3.5-.5 5-1.3" strokeLinecap="round"/>
              <path d="M12 6c-2 2-3 5-2 8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="stat-label">Current Season</p>
            <p className="stat-value">{season || 'Detecting...'}</p>
          </div>
        </div>

        {/* Tip of Day */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="stat-icon" style={{ background: 'var(--bronze-50)' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--bronze-500)' }} stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18h6M12 2v1M21 12h1M3 12H2M18.36 5.64l-.7.7M5.64 5.64l.7.7" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="5"/>
            </svg>
          </div>
          <div>
            <p className="stat-label">Tip of the Day</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--stone-700)', lineHeight: '1.5' }}>{tipOfDay}</p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="feature-grid">
          {[
            { title: 'Crop Scanner', desc: 'AI-powered disease detection and treatment plans', link: '/scanner', color: 'var(--forest-50)', dotColor: 'var(--forest-500)' },
            { title: 'Weather Planner', desc: '7-day forecast with irrigation scheduling', link: '/weather', color: 'var(--info-50)', dotColor: 'var(--info-500)' },
            { title: 'Encyclopedia', desc: 'Complete crop profiles and growing guides', link: '/encyclopedia', color: 'var(--bronze-50)', dotColor: 'var(--bronze-500)' },
            { title: 'My Crop', desc: 'Your personalized crop dashboard and history', link: '/my-crop', color: 'var(--forest-50)', dotColor: 'var(--forest-500)' },
          ].map((card) => (
            <Link key={card.title} to={card.link} className="glass-card glass-card-hover feature-card">
              <div className="feature-card-icon" style={{ background: card.color }}>
                <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: card.dotColor }} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Agriculture News */}
      <section>
        <h2 className="section-title mb-4">Latest Agriculture News</h2>
        {loadingNews ? (
          <SkeletonNews />
        ) : newsArticles.length > 0 ? (
          <div className="news-grid">
            {newsArticles.slice(0, 6).map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--stone-400)', fontSize: '0.875rem', padding: '2rem 0' }}>
            Unable to load news. Please check your connection.
          </p>
        )}
      </section>
    </div>
  );
}
