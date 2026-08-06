import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function PricingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(8);

  // Auto-redirect to dashboard after countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="pricing-success-page">
      <SEOHead title="Welcome to Premium! — Rooted" noIndex />

      <div className="pricing-success-card">
        <div className="pricing-success-icon">🎉</div>
        <h1>Welcome to Premium!</h1>
        <p className="pricing-success-lead">
          You now have unlimited access to expert articles, priority booking for
          expert sessions, personalised recommendations, and more.
        </p>

        {sessionId && (
          <p className="pricing-success-ref">
            Reference: <code>{sessionId.slice(-12)}</code>
          </p>
        )}

        <div className="pricing-success-features">
          <div className="ps-feature"><span>✨</span> Unlimited articles & resources</div>
          <div className="ps-feature"><span>👩‍⚕️</span> Priority expert booking</div>
          <div className="ps-feature"><span>📊</span> Advanced milestone analytics</div>
          <div className="ps-feature"><span>💬</span> Full community access</div>
        </div>

        <div className="pricing-success-actions">
          <Link to="/dashboard" className="btn-forest">
            Go to My Dashboard
          </Link>
          <Link to="/articles" className="btn-outline">
            Browse Articles
          </Link>
        </div>

        <p className="pricing-success-auto">
          Redirecting to dashboard in {countdown}s…
        </p>
      </div>
    </div>
  );
}
