import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../services/api';
import '../styles/design-system.css';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const authed = isAuthenticated();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} aria-label="Primary">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="Rooted — home">
          <span className="logo-icon" aria-hidden="true">🌳</span>
          <div className="logo-text">
            <span className="logo-name">Rooted</span>
            <span className="logo-sub">Growing together. Raising kind humans.</span>
          </div>
        </Link>

        {/* Nav links */}
        <ul className="nav-links">
          {[
            { to: '/articles', label: 'Articles' },
            { to: '/courses', label: 'Courses' },
            { to: '/community', label: 'Community' },
            { to: '/resources', label: 'Resources' },
            { to: '/experts', label: 'Experts' },
            { to: '/about', label: 'About' },
          ].map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="nav-right">
          {authed ? (
            <Link to="/dashboard" className="btn-forest">My Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="nav-login">Log in</Link>
              <Link to="/pricing" className="btn-forest">Join Our Community</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
