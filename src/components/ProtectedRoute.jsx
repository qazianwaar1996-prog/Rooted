import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * ProtectedRoute — wraps dashboard and any other auth-only pages.
 * Checks localStorage for a valid JWT; redirects to /login if missing.
 * Shows a loading skeleton while verifying.
 */
export default function ProtectedRoute({ children }) {
  const [state, setState] = useState('loading'); // loading | authed | unauth
  const location = useLocation();

  useEffect(() => {
    // Small delay so the loading state is visible (avoids flash)
    const t = setTimeout(() => {
      setState(isAuthenticated() ? 'authed' : 'unauth');
    }, 300);
    return () => clearTimeout(t);
  }, []);

  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'var(--font-body)',
        color: 'var(--forest)',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid var(--sand)',
          borderTopColor: 'var(--forest)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--stone)' }}>
          Verifying your session…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'unauth') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
