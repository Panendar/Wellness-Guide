import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/challenge', label: 'Daily Challenge', icon: '🎯' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/favorites', label: 'Favorites', icon: '❤️' },
    { path: '/history', label: 'History', icon: '📅' },
    { path: '/configure', label: 'Configure', icon: '⚙️' },
    { path: '/practice', label: 'Practice', icon: '🧘' },
    { path: '/achievements', label: 'Achievements', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="navigation">
        <div className="nav-container">
          {/* Logo/Brand */}
          <Link to="/dashboard" className="nav-brand" onClick={closeMenu}>
            <span className="brand-icon">🧘</span>
            <span className="brand-text">Wellness Guide</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="nav-user">
            <div className="user-avatar">
              {currentUser?.full_name?.[0] || currentUser?.username?.[0] || 'U'}
            </div>
            <div className="user-info desktop">
              <span className="user-name">
                {currentUser?.full_name || currentUser?.username}
              </span>
              <span className="user-email">{currentUser?.email}</span>
            </div>
            <button className="btn-logout desktop" onClick={onLogout}>
              Logout
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="menu-toggle mobile"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={closeMenu}></div>
          <div className="mobile-menu">
            <div className="mobile-user-section">
              <div className="mobile-user-avatar">
                {currentUser?.full_name?.[0] || currentUser?.username?.[0] || 'U'}
              </div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">
                  {currentUser?.full_name || currentUser?.username}
                </span>
                <span className="mobile-user-email">{currentUser?.email}</span>
              </div>
            </div>

            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="mobile-nav-icon">{link.icon}</span>
                  <span className="mobile-nav-label">{link.label}</span>
                </Link>
              ))}
            </div>

            <button className="mobile-logout" onClick={() => { onLogout(); closeMenu(); }}>
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
