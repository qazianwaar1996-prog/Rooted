import { Link, useLocation } from 'react-router-dom';
import '../styles/design-system.css';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🌳</span>
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
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="nav-right">
          <Link to="/dashboard" className="nav-login">Log in</Link>
          <Link to="/pricing" className="btn-forest">Join Our Community</Link>
        </div>
      </div>
    </nav>
  );
}
