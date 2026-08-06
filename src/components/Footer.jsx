import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon" aria-hidden="true">🌳</span>
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
        <ul className="footer-trust">
          <li><span className="trust-check" aria-hidden="true">✓</span> Expert-reviewed</li>
          <li><span className="trust-check" aria-hidden="true">✓</span> Privacy-first</li>
          <li><span className="trust-check" aria-hidden="true">✓</span> Built for families</li>
        </ul>
        <div className="social-links">
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/>
              <circle cx="12" cy="12" r="4.2"/>
              <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="#" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4l16 16M20 4L4 20"/>
            </svg>
          </a>
          <a href="#" aria-label="Pinterest">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9.2"/>
              <path d="M9.2 15.5c1-2.6 1.6-5.6 2-8.6M10.5 10.6c-.6-.5-1.4-.6-2-.1-.9.8-1.2 2.5-.4 3.7.5.8 1.5 1 2.4.7M13.6 13.2c-.6-.4-1.4-.3-2 .1-.7.5-1.2 1.4-1.3 2.4-.1.9.1 2 1 2.5.7.4 1.7.2 2.3-.5.7-.9 1-2 1.2-3.1.2-.9-.1-1.9-.9-2.2z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
