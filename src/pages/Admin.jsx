import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { getToken, isAuthenticated } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function adminFetch(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    const token = getToken();
    (async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminFetch('/admin/stats', token),
          adminFetch('/admin/users', token),
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message || 'Admin access denied. You need an admin account.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <SEOHead title="Admin — Rooted" noIndex />
        <div className="dash-loader">
          <div className="dash-spinner" />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <SEOHead title="Admin — Rooted" noIndex />
        <div className="empty-state-card" style={{ maxWidth: 500, margin: '80px auto' }}>
          <div className="empty-icon">🔒</div>
          <h3>Access Denied</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const maxSignup = Math.max(...(stats?.signups_14d?.map(s => s.count) || [1]));

  return (
    <div className="admin-page">
      <SEOHead title="Admin Dashboard — Rooted" noIndex />

      <header className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Internal analytics for Rooted</p>
      </header>

      {/* ── Stat cards ──────────────────────────── */}
      <div className="admin-stats-grid">
        <StatCard label="Total Signups" value={stats?.total_users?.toLocaleString()} icon="👥" />
        <StatCard label="New This Week" value={`+${stats?.new_this_week}`} icon="🆕" color="green" />
        <StatCard label="Daily Active" value={stats?.daily_active_users} icon="📈" />
        <StatCard label="Children Profiled" value={stats?.total_children?.toLocaleString()} icon="👶" color="amber" />
        <StatCard label="Bookings This Week" value={stats?.bookings_this_week} icon="📅" />
        <StatCard label="Confirmed" value={stats?.confirmed_bookings} icon="✅" color="green" />
        <StatCard label="Premium Users" value={stats?.premium_users} icon="⭐" color="amber" />
        <StatCard label="Conversion Rate" value={`${stats?.conversion_rate}%`} icon="🔄" color="forest" />
      </div>

      {/* ── 14-day signup chart ────────────────── */}
      <div className="admin-chart-card">
        <h3>Signups — Last 14 Days</h3>
        <div className="admin-chart">
          {stats?.signups_14d?.map((day) => (
            <div key={day.date} className="admin-bar-col">
              <span className="admin-bar-value">{day.count}</span>
              <div
                className="admin-bar"
                style={{ height: `${maxSignup ? (day.count / maxSignup) * 120 : 0}px` }}
              />
              <span className="admin-bar-label">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent users table ─────────────────── */}
      <div className="admin-table-card">
        <h3>Recent Users</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`sub-plan-badge tier-${u.subscription_tier}`}>
                      {u.subscription_tier === 'premium' ? '🌟 Premium' : 'Free'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'forest' }) {
  const colors = {
    forest: 'var(--forest)',
    green: '#2E7D32',
    amber: 'var(--amber)',
  };
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-icon" style={{ background: (colors[color] || colors.forest) + '12' }}>
        {icon}
      </span>
      <div>
        <div className="admin-stat-value" style={{ color: colors[color] || colors.forest }}>
          {value}
        </div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}
