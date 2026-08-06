import { useState } from 'react';

export default function Sidebar() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setSuccess(true);
    setEmail('');
  };

  return (
    <aside className="sidebar">
      {/* Live Community */}
      <div className="sidebar-live">
        <div className="live-header">
          <h3 className="live-title">Live Community</h3>
          <div className="live-dot-wrap">
            <div className="live-dot"></div>
            <span className="live-count">3,452 parents online</span>
          </div>
        </div>
        <p className="live-sub">Recent activity from parents around the world</p>

        <div className="activity-list" id="activityList">
          {[
            { name: 'Jessica M.', action: 'Just shared a story about toddler sleep', time: '2m ago', bg: '#E8D8C8', letter: 'J' },
            { name: 'Robert D.', action: 'Asked a question about picky eating', time: '8m ago', bg: '#D8E4D0', letter: 'R' },
            { name: 'Aisha K.', action: 'Joined the community', time: '15m ago', bg: '#D8D0E4', letter: 'A' },
            { name: 'Mike T.', action: 'Shared a helpful resource on discipline', time: '22m ago', bg: '#E4D8D0', letter: 'M' },
            { name: 'Sarah L.', action: 'Completed the Newborn course', time: '35m ago', bg: '#D0E4E0', letter: 'S' },
          ].map((item, index) => (
            <div key={item.name + item.time} className="activity-item" style={{ '--stagger': `${index * 70}ms` }}>
              <div className="act-avatar" style={{ background: item.bg }} aria-hidden="true">{item.letter}</div>
              <div className="act-body">
                <div className="act-name">{item.name}</div>
                <div className="act-action">{item.action}</div>
              </div>
              <div className="act-time">{item.time}</div>
            </div>
          ))}
        </div>
        <a href="#" className="view-all-link">View all activity <span className="view-all-arrow" aria-hidden="true">→</span></a>
      </div>

      {/* Stats */}
      <div className="sidebar-stats">
        <h4 className="stats-title">Our Community in Numbers</h4>
        <div className="stats-grid">
          {[
            { icon: '👨‍👩‍👧', num: '75,000+', lbl: 'Active Parents' },
            { icon: '📝', num: '2,300+', lbl: 'Expert Articles' },
            { icon: '🎓', num: '120+', lbl: 'Courses & Guides' },
            { icon: '❤️', num: '98%', lbl: 'Recommend Us' },
            { icon: '💬', num: '8,934', lbl: 'Posts This Week' },
            { icon: '🛠️', num: '500+', lbl: 'Resources & Tools' },
          ].map((stat) => (
            <div key={stat.lbl} className="stat-cell">
              <div className="stat-icon-wrap">{stat.icon}</div>
              <div className="stat-data">
                <div className="stat-num">{stat.num}</div>
                <div className="stat-lbl">{stat.lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Capture */}
      <div className="sidebar-email" id="email">
        <div className="email-icon">✉️</div>
        <h3 className="email-title">Parenting support, straight to your inbox</h3>
        <p className="email-sub">Get weekly tips, expert advice and community highlights.</p>

        {!success ? (
          <>
            <label className="sr-only" htmlFor="sidebar-email-input">Email address</label>
            <input
              id="sidebar-email-input"
              className={`email-input ${error ? 'email-input-error' : ''}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
            />
            <button className="btn-amber" type="button" onClick={handleSubscribe}>Subscribe</button>
            <div className="email-note">
              <span>🔒</span> No spam. Unsubscribe anytime.
            </div>
          </>
        ) : (
          <div className="success-msg" style={{ display: 'block', animation: 'fadeIn 0.4s ease' }}>🌱 Welcome to the community!</div>
        )}
      </div>
    </aside>
  );
}
