import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { isAuthenticated, createCheckoutSession } from '../services/api';

const FEATURES = [
  { name: 'Expert articles', free: '5 per month', premium: 'Unlimited', highlight: true },
  { name: 'Community access', free: 'Read only', premium: 'Full access (post + comment)' },
  { name: 'Expert sessions', free: '—', premium: 'Priority booking' },
  { name: 'Milestone tracker', free: 'Basic', premium: 'Advanced analytics' },
  { name: 'Saved articles', free: 'Up to 10', premium: 'Unlimited' },
  { name: 'Screen time calculator', free: '✓', premium: '✓' },
  { name: 'Parenting quiz', free: '✓', premium: '✓' },
  { name: 'Child profiles', free: '1 child', premium: 'Unlimited children' },
  { name: 'Personalised recommendations', free: '—', premium: '✓' },
  { name: 'Weekly digest', free: '—', premium: '✓' },
  { name: 'Priority support', free: '—', premium: '✓' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }
    setError('');
    setUpgradeLoading(true);
    try {
      const origin = window.location.origin;
      const data = await createCheckoutSession(
        `${origin}/pricing/success`,
        `${origin}/pricing`
      );
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="pricing-page">
      <SEOHead
        title="Pricing — Free & Premium Plans for Parents"
        description="Start free with Rooted's essential parenting tools. Upgrade to Premium ($9.99/mo) for unlimited articles, priority expert booking, advanced milestone analytics, and full community access."
        keywords="Rooted pricing, parenting platform pricing, premium parenting subscription"
        canonicalUrl="https://rooted-parenting.com/pricing"
      />

      {/* Header */}
      <header className="pricing-hero">
        <h1>Simple, transparent pricing</h1>
        <p>Start free. Upgrade when you're ready for more support on your parenting journey.</p>
      </header>

      {error && <div className="dash-toast error" style={{ maxWidth: 600, margin: '0 auto 24px' }}>{error}</div>}

      {/* Two-column plan cards */}
      <div className="pricing-cols">
        {/* Free */}
        <div className="pricing-card">
          <div className="pricing-card-header">
            <h2>Free</h2>
            <div className="pricing-price">
              <span className="pricing-amount">$0</span>
              <span className="pricing-period">/ forever</span>
            </div>
            <p className="pricing-desc">Everything you need to get started on your parenting journey.</p>
          </div>
          <div className="pricing-features">
            {FEATURES.map((f) => (
              <div key={f.name} className={`pricing-feature-row ${f.highlight ? 'highlight' : ''}`}>
                <span className="pricing-feature-name">{f.name}</span>
                <span className="pricing-feature-value">{f.free === '✓' ? <span className="check">✓</span> : f.free}</span>
              </div>
            ))}
          </div>
          <div className="pricing-card-footer">
            <Link to="/register" className="btn-outline pricing-btn-wide">Get Started Free</Link>
          </div>
        </div>

        {/* Premium */}
        <div className="pricing-card premium">
          <div className="pricing-badge">Most Popular</div>
          <div className="pricing-card-header">
            <h2>Premium</h2>
            <div className="pricing-price">
              <span className="pricing-amount">$9.99</span>
              <span className="pricing-period">/ month</span>
            </div>
            <p className="pricing-desc">Unlock the full Rooted experience with unlimited access to experts, articles, and tools.</p>
          </div>
          <div className="pricing-features">
            {FEATURES.map((f) => (
              <div key={f.name} className={`pricing-feature-row ${f.highlight ? 'highlight' : ''}`}>
                <span className="pricing-feature-name">{f.name}</span>
                <span className="pricing-feature-value premium-val">
                  {f.premium === '✓' ? <span className="check">✓</span> : f.premium}
                </span>
              </div>
            ))}
          </div>
          <div className="pricing-card-footer">
            <button
              className="btn-forest pricing-btn-wide"
              onClick={handleUpgrade}
              disabled={upgradeLoading}
            >
              {upgradeLoading ? 'Redirecting to Stripe…' : 'Upgrade to Premium'}
            </button>
            <p className="pricing-note">Cancel anytime. No lock-in.</p>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="pricing-trust">
        <div className="pricing-trust-item">
          <span className="pricing-trust-icon">🔒</span>
          <span>Secure payment via Stripe</span>
        </div>
        <div className="pricing-trust-item">
          <span className="pricing-trust-icon">🔄</span>
          <span>Cancel anytime</span>
        </div>
        <div className="pricing-trust-item">
          <span className="pricing-trust-icon">💬</span>
          <span>Priority support on Premium</span>
        </div>
      </div>

      {/* FAQ */}
      <div className="pricing-faq">
        <h3>Frequently asked questions</h3>
        <div className="pricing-faq-grid">
          <div className="pricing-faq-item">
            <h4>Can I switch plans later?</h4>
            <p>Yes! You can upgrade to Premium at any time from your dashboard settings. Downgrading takes effect at the end of your billing period.</p>
          </div>
          <div className="pricing-faq-item">
            <h4>Is my payment secure?</h4>
            <p>All payments are processed securely through Stripe. We never store your credit card details on our servers.</p>
          </div>
          <div className="pricing-faq-item">
            <h4>What happens when I cancel?</h4>
            <p>Your Premium benefits remain active until the end of your current billing period. After that, your account reverts to the Free plan.</p>
          </div>
          <div className="pricing-faq-item">
            <h4>Do you offer refunds?</h4>
            <p>We don't offer refunds for partial months, but you can cancel anytime and you won't be charged again.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
