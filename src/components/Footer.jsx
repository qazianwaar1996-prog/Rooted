import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">🌳</span>
            <span className="logo-name">Rooted</span>
          </Link>
          <p className="footer-tagline">Growing together. Raising kind humans.</p>
        </div>

        {/* Columns */}
        <div className="footer-columns">
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/articles">Articles</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/experts">Experts</Link></li>
              <li><Link to="/resources">Resources</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li><Link to="/community">Join the Community</Link></li>
              <li><Link to="/pricing">Membership</Link></li>
              <li><Link to="/dashboard">Parent Forum</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="#">Help Center</Link></li>
              <li><Link to="#">Contact</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Rooted. All rights reserved.</p>
        <div className="social-links">
          <a href="#" aria-label="Instagram">📸</a>
          <a href="#" aria-label="Twitter">🐦</a>
          <a href="#" aria-label="Pinterest">📌</a>
        </div>
      </div>
    </footer>
  );
}
