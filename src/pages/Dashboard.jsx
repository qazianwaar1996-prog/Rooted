import { useState } from 'react';
import articlesData from '../data/articles.json';
import expertsData from '../data/experts.json';
import '../styles/app.css';

export default function Dashboard() {
  const [userName, setUserName] = useState('Jessica M.');
  const [userEmail, setUserEmail] = useState('jessica.m@example.com');
  const [tier, setTier] = useState('premium');
  const [savedArticles, setSavedArticles] = useState([
    'screen-time-by-age-2026-complete-guide',
    'why-your-toddler-says-no-to-everything',
    'toddler-milestones-at-18-months-whats-normal',
  ]);
  const [children, setChildren] = useState([
    { id: 1, name: 'Oliver', dob: '2024-02-15', gender: 'Male', ageYears: 1, ageMonths: 5 },
    { id: 2, name: 'Sofia', dob: '2022-09-03', gender: 'Female', ageYears: 3, ageMonths: 10 },
  ]);
  const [bookings, setBookings] = useState([
    { id: 101, expertName: 'Dr. Sarah Chen', date: '2026-08-12', time: '2:00 PM', status: 'confirmed', format: 'Video Call' },
    { id: 102, expertName: 'Emily Watson', date: '2026-08-05', time: '10:00 AM', status: 'done', format: 'Video Call' },
  ]);

  const removeSaved = (slug) => setSavedArticles(s => s.filter(a => a !== slug));
  const removeChild = (id) => setChildren(c => c.filter(ch => ch.id !== id));
  const addChild = () => {
    const newChild = { id: Date.now(), name: 'New Child', dob: '2025-01-01', gender: 'Unknown', ageYears: 1, ageMonths: 6 };
    setChildren(c => [...c, newChild]);
  };

  const calculateAge = (dobStr) => {
    const birth = new Date(dobStr);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    if (today.getDate() < birth.getDate()) months--;
    return { years: Math.floor(months / 12), months: months % 12 };
  };

  return (
    <div className="dashboard-page">
      {/* Welcome hero */}
      <header className="dashboard-hero">
        <div>
          <h1>Welcome, {userName}</h1>
          <p className="dashboard-subtitle">Your parenting journey, organized and at your fingertips.</p>
        </div>
        <div className="dashboard-tier-badge">
          <span className="tier-label">Subscription</span>
          <span className={`tier-value tier-${tier}`}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
        </div>
      </header>

      {/* Quick stats */}
      <section className="dashboard-stats" aria-label="Account overview">
        <div className="stat-card">
          <div className="stat-number">{savedArticles.length}</div>
          <div className="stat-label">Saved Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{bookings.length}</div>
          <div className="stat-label">Expert Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{children.length}</div>
          <div className="stat-label">Child Profiles</div>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Left column */}
        <div className="dashboard-col">
          {/* Profile */}
          <section className="dashboard-card" aria-label="Profile">
            <div className="card-header">
              <h2>Profile</h2>
            </div>
            <div className="profile-form">
              <label htmlFor="dash-name">Name</label>
              <input id="dash-name" type="text" value={userName} onChange={e => setUserName(e.target.value)} />
              <label htmlFor="dash-email">Email</label>
              <input id="dash-email" type="email" value={userEmail} disabled />
            </div>
          </section>

          {/* Saved Articles */}
          <section className="dashboard-card" aria-label="Saved articles">
            <div className="card-header">
              <h2>Saved Articles</h2>
              <span className="card-count">{savedArticles.length}</span>
            </div>
            <div className="saved-articles-list">
              {savedArticles.length === 0 ? (
                <p className="empty-state">No articles saved yet.</p>
              ) : (
                savedArticles.map(slug => {
                  const article = articlesData.find(a => a.slug === slug);
                  if (!article) return null;
                  return (
                    <div key={slug} className="saved-article-row">
                      <div className="saved-article-info">
                        <a href={`/articles/${slug}`} className="saved-article-title">{article.title}</a>
                        <span className="saved-article-tag">{article.category}</span>
                      </div>
                      <button className="btn-outline btn-small" onClick={() => removeSaved(slug)} aria-label={`Remove ${article.title}`}>Remove</button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="dashboard-col">
          {/* Children */}
          <section className="dashboard-card" aria-label="Child profiles">
            <div className="card-header">
              <h2>Child Profiles</h2>
              <button className="btn-forest btn-small" onClick={addChild}>+ Add Child</button>
            </div>
            <div className="children-grid">
              {children.map(child => {
                const age = calculateAge(child.dob);
                return (
                  <div key={child.id} className="child-card">
                    <div className="child-card-header">
                      <span className="child-avatar">{child.name[0]}</span>
                      <div className="child-info">
                        <h3>{child.name}</h3>
                        <span className="child-age">{age.years > 0 ? age.years + 'y ' : ''}{age.months}m</span>
                        <span className="child-gender">{child.gender}</span>
                      </div>
                    </div>
                    <button className="btn-outline btn-small" onClick={() => removeChild(child.id)} aria-label={`Remove ${child.name}`}>Remove</button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bookings */}
          <section className="dashboard-card" aria-label="Expert bookings">
            <div className="card-header">
              <h2>Expert Bookings</h2>
            </div>
            <div className="bookings-list">
              {bookings.map(b => {
                const expert = expertsData.find(e => e.id === b.expertId) || expertsData.find(e => e.id === 1);
                return (
                  <div key={b.id} className="booking-row">
                    <div className="booking-row-main">
                      <h4>{expert?.name || b.expertName}</h4>
                      <span className="booking-date">{b.date} at {b.time}</span>
                    </div>
                    <span className={`booking-status status-${b.status}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
