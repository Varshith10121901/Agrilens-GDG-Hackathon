import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/my-crop', label: 'My Crop' },
  { path: '/scanner', label: 'Scanner' },
  { path: '/weather', label: 'Weather' },
  { path: '/encyclopedia', label: 'Encyclopedia' },
];

export default function Navbar() {
  const { farmer, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = farmer?.name
    ? farmer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar-desktop">
        <div className="navbar-desktop-inner">
          <NavLink to="/" className="navbar-logo">
            <div className="navbar-logo-icon gradient-primary">
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '1rem', height: '1rem', color: 'white' }} stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.8 0 3.5-.5 5-1.3" strokeLinecap="round"/>
                <path d="M12 6c-2 2-3 5-2 8M14 4c1 3 1 6 0 9" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="navbar-brand">
              Agri<span>Lens</span>
            </span>
          </NavLink>

          <div className="navbar-links">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="navbar-profile-btn gradient-primary"
            >
              {initials}
            </button>

            {showProfile && (
              <div className="navbar-dropdown glass-card">
                <div className="navbar-dropdown-info">
                  <p className="navbar-dropdown-name">{farmer?.name}</p>
                  {farmer?.location && (
                    <p className="navbar-dropdown-location">{farmer.location}</p>
                  )}
                </div>
                <button onClick={logout} className="navbar-logout-btn">
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="navbar-mobile">
        <div className="navbar-mobile-inner">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `navbar-mobile-link ${isActive ? 'active' : ''}`
              }
            >
              <div className="navbar-mobile-dot" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Spacer for desktop nav */}
      <div className="navbar-spacer-desktop" />
    </>
  );
}
