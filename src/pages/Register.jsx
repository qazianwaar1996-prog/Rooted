import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { registerUser, isAuthenticated } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEOHead title="Create Account — Rooted" noIndex />

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🌳 Rooted</Link>
          <h1>Join Rooted</h1>
          <p>Start your parenting journey with expert guidance</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="Jessica M."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
          />

          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
          />

          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />

          <label htmlFor="reg-confirm">Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />

          <button type="submit" className="btn-forest auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
