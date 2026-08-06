import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { loginUser, isAuthenticated } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authed, skip to dashboard
  useEffect(() => {
    if (isAuthenticated()) navigate(from, { replace: true });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEOHead title="Sign In — Rooted" noIndex />

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🌳 Rooted</Link>
          <h1>Welcome back</h1>
          <p>Sign in to your parenting dashboard</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" className="btn-forest auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>

        {/* Demo helper */}
        <div className="auth-demo">
          <p>Demo credentials</p>
          <code>demo@rooted.app / password123</code>
        </div>
      </div>
    </div>
  );
}
