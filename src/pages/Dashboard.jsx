import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import articlesData from '../data/articles.json';
import expertsData from '../data/experts.json';
import SEOHead from '../components/SEOHead';
import {
  getToken, removeToken, isOnboarded,
  getSubscriptionStatus, cancelSubscription, createCheckoutSession,
} from '../services/api';

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */

function calculateAge(dobStr) {
  const birth = new Date(dobStr);
  const today = new Date();
  let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months--;
  const years = Math.floor(months / 12);
  return { years, months: months % 12 };
}

function getStage(ageYears, ageMonths) {
  const totalMonths = ageYears * 12 + ageMonths;
  if (totalMonths < 3) return { label: 'Newborn', color: '#8B9DC3' };
  if (totalMonths < 12) return { label: 'Infant', color: '#7BA87B' };
  if (totalMonths < 36) return { label: 'Toddler', color: '#D4943A' };
  if (totalMonths < 60) return { label: 'Preschool', color: '#C47A5A' };
  if (totalMonths < 144) return { label: 'School Age', color: '#5A8F45' };
  return { label: 'Teen', color: '#6B5B7B' };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ──────────────────────────────────────────────────────────────
   Local storage helpers (demo mode fallback)
   ────────────────────────────────────────────────────────────── */

function loadChildren() {
  try { return JSON.parse(localStorage.getItem('rooted_children') || '[]'); }
  catch { return []; }
}
function saveChildren(children) {
  localStorage.setItem('rooted_children', JSON.stringify(children));
}

function loadSavedSlugs() {
  try { return JSON.parse(localStorage.getItem('rooted_saved') || '[]'); }
  catch { return []; }
}
function saveSavedSlugs(slugs) {
  localStorage.setItem('rooted_saved', JSON.stringify(slugs));
}

function loadBookings() {
  try { return JSON.parse(localStorage.getItem('rooted_bookings') || '[]'); }
  catch { return []; }
}
function saveBookings(bookings) {
  localStorage.setItem('rooted_bookings', JSON.stringify(bookings));
}

/* ──────────────────────────────────────────────────────────────
   Demo seed data
   ────────────────────────────────────────────────────────────── */

function seedIfEmpty() {
  if (!localStorage.getItem('rooted_children')) {
    saveChildren([
      { id: 1, name: 'Oliver', dob: '2024-02-15' },
      { id: 2, name: 'Sofia', dob: '2022-09-03' },
    ]);
  }
  if (!localStorage.getItem('rooted_saved')) {
    saveSavedSlugs([
      'screen-time-by-age-2026-complete-guide',
      'why-your-toddler-says-no-to-everything',
      'toddler-milestones-at-18-months-whats-normal',
    ]);
  }
  if (!localStorage.getItem('rooted_bookings')) {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 7);
    const past = new Date(now);
    past.setDate(past.getDate() - 14);
    saveBookings([
      { id: 101, expertId: 1, date: future.toISOString().split('T')[0], time: '2:00 PM', status: 'confirmed' },
      { id: 102, expertId: 3, date: future.toISOString().split('T')[0], time: '10:30 AM', status: 'pending' },
      { id: 103, expertId: 4, date: past.toISOString().split('T')[0], time: '11:00 AM', status: 'done' },
    ]);
  }
}

/* ──────────────────────────────────────────────────────────────
   Components
   ────────────────────────────────────────────────────────────── */

/** Avatar circle from initials */
function Avatar({ name, size = 40, style = {} }) {
  const initial = (name || '?')[0].toUpperCase();
  return (
    <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.42, ...style }}>
      {initial}
    </div>
  );
}

/** Stage badge pill */
function StageBadge({ stage }) {
  return (
    <span className="stage-badge" style={{ background: stage.color + '18', color: stage.color, borderColor: stage.color + '30' }}>
      {stage.label}
    </span>
  );
}

/** Modal wrapper */
function Modal({ children, onClose, title }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Empty state component */
function EmptyState({ icon, title, message, ctaLabel, ctaTo, onCta }) {
  return (
    <div className="empty-state-card">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {ctaTo && !onCta && (
        <Link to={ctaTo} className="btn-forest btn-small">{ctaLabel}</Link>
      )}
      {onCta && (
        <button className="btn-forest btn-small" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}

/** Confirmation dialog */
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="confirm-dialog">
      <p>{message}</p>
      <div className="confirm-actions">
        <button className="btn-outline btn-small" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn-danger btn-small" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Dashboard
   ────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('family');
  const [loading, setLoading] = useState(true);

  // Profile
  const [profile, setProfile] = useState({ name: 'Jessica M.', email: 'jessica.m@example.com' });

  // Children
  const [children, setChildren] = useState([]);

  // Saved articles
  const [savedSlugs, setSavedSlugs] = useState([]);

  // Bookings
  const [bookings, setBookings] = useState([]);

  // Modals
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDOB, setNewChildDOB] = useState('');

  // Settings
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [digestOn, setDigestOn] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Review modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Subscription
  const [subTier, setSubTier] = useState('free');
  const [subRenewal, setSubRenewal] = useState(null);
  const [subCancelAtEnd, setSubCancelAtEnd] = useState(false);
  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [cancelSubLoading, setCancelSubLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Error & feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Bootstrap ──────────────────────────────────────────────
  useEffect(() => {
    seedIfEmpty();
    setChildren(loadChildren());
    setSavedSlugs(loadSavedSlugs());
    setBookings(loadBookings());
    setSettingsName(profile.name);
    setSettingsEmail(profile.email);

    // Load subscription status
    (async () => {
      try {
        const sub = await getSubscriptionStatus();
        setSubTier(sub.tier);
        setSubRenewal(sub.renewal_date);
        setSubCancelAtEnd(sub.cancel_at_period_end);
      } catch { /* use defaults */ }
    })();

    // Simulate API fetch delay
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Sync settings fields when profile changes
  useEffect(() => {
    setSettingsName(profile.name);
    setSettingsEmail(profile.email);
  }, [profile]);

  // ── Handlers ───────────────────────────────────────────────

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  // Children
  const handleAddChild = () => {
    setError('');
    if (!newChildName.trim() || !newChildDOB) {
      setError('Please enter both name and date of birth.');
      return;
    }
    const updated = [...children, { id: Date.now(), name: newChildName.trim(), dob: newChildDOB }];
    saveChildren(updated);
    setChildren(updated);
    setNewChildName('');
    setNewChildDOB('');
    setShowAddChild(false);
    setError('');
  };

  const handleRemoveChild = (id) => {
    const updated = children.filter((c) => c.id !== id);
    saveChildren(updated);
    setChildren(updated);
  };

  // Saved articles
  const handleRemoveSaved = (slug) => {
    const updated = savedSlugs.filter((s) => s !== slug);
    saveSavedSlugs(updated);
    setSavedSlugs(updated);
  };

  // Bookings
  const handleLeaveReview = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewText('');
  };

  const handleSubmitReview = () => {
    if (!reviewBooking) return;
    const updated = bookings.map((b) =>
      b.id === reviewBooking.id ? { ...b, reviewed: true, reviewRating, reviewText } : b
    );
    saveBookings(updated);
    setBookings(updated);
    setReviewBooking(null);
    setSuccess('Review submitted! Thank you.');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Settings
  const handleSaveSettings = () => {
    setProfile({ name: settingsName, email: settingsEmail });
    setSuccess('Settings saved.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteAccount = () => {
    setDeleteLoading(true);
    setTimeout(() => {
      removeToken();
      localStorage.clear();
      navigate('/login', { replace: true });
    }, 1200);
  };

  // Subscription
  const handleUpgrade = async () => {
    setError('');
    setUpgradeLoading(true);
    try {
      const origin = window.location.origin;
      const data = await createCheckoutSession(
        `${origin}/pricing/success`,
        `${origin}/dashboard`
      );
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout.');
      setUpgradeLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelSubLoading(true);
    try {
      const result = await cancelSubscription();
      setSubCancelAtEnd(true);
      if (result.renewal_date) setSubRenewal(result.renewal_date);
      setSuccess(result.message || 'Subscription will be cancelled at period end.');
      setShowCancelSubConfirm(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription.');
      setShowCancelSubConfirm(false);
      setTimeout(() => setError(''), 4000);
    } finally {
      setCancelSubLoading(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────
  const savedArticles = savedSlugs
    .map((slug) => articlesData.find((a) => a.slug === slug))
    .filter(Boolean);

  const now = new Date();
  const upcomingBookings = bookings
    .filter((b) => b.status !== 'done' || new Date(b.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastBookings = bookings
    .filter((b) => b.status === 'done' || new Date(b.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Recommended: use youngest child's stage
  const youngestChild = children
    .map((c) => ({ ...c, ...calculateAge(c.dob) }))
    .sort((a, b) => (a.years * 12 + a.months) - (b.years * 12 + b.months))[0];

  const youngestStage = youngestChild ? getStage(youngestChild.years, youngestChild.months) : null;

  const recommendedArticles = youngestStage
    ? articlesData
        .filter((a) => a.category === youngestStage.label || a.tags?.includes(youngestStage.label))
        .slice(0, 6)
    : articlesData.slice(0, 6);

  // Recommend experts based on stage-related specialties
  const stageExpertMap = {
    Newborn: ['Infant Sleep', 'Newborn Sleep', 'Sleep Medicine'],
    Infant: ['Infant Sleep', 'Toddler Sleep', 'Family Nutrition'],
    Toddler: ['Toddler Sleep', 'Positive Discipline', 'Emotional Regulation', 'Picky Eating'],
    Preschool: ['Positive Discipline', 'Emotional Literacy', 'Anxiety', 'Sibling Dynamics'],
    'School Age': ['Anxiety', 'Digital Wellness', 'Cognitive Behavioral Therapy', 'Screen Time Strategy'],
    Teen: ['Anxiety', 'Digital Wellness', 'Cognitive Behavioral Therapy', 'Adolescent Sleep'],
  };

  const recommendedExperts = (() => {
    if (!youngestStage) return expertsData.slice(0, 3);
    const specialities = stageExpertMap[youngestStage.label] || [];
    const scored = expertsData.map((e) => {
      const matchCount = (e.specialities || []).filter((s) => specialities.includes(s)).length;
      return { ...e, _score: matchCount };
    });
    return scored.sort((a, b) => b._score - a._score).slice(0, 3);
  })();

  // ── Sidebar tabs ───────────────────────────────────────────
  const tabs = [
    { id: 'family', label: 'My Family', icon: '👨‍👩‍👧' },
    { id: 'saved', label: 'Saved Articles', icon: '📌' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'recommended', label: 'Recommended For You', icon: '✨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash-loader">
        <div className="dash-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <SEOHead title="My Dashboard — Rooted" noIndex />
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          {/* Avatar + name */}
          <div className="dash-user-info">
            <Avatar name={profile.name} size={52} style={{ background: 'linear-gradient(135deg, var(--amber) 0%, var(--amber-lt) 100%)', color: '#fff' }} />
            <div>
              <div className="dash-user-name">{profile.name}</div>
              <div className="dash-user-email">{profile.email}</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="dash-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`dash-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="dash-nav-icon">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'saved' && savedSlugs.length > 0 && (
                  <span className="dash-nav-badge">{savedSlugs.length}</span>
                )}
                {tab.id === 'bookings' && upcomingBookings.length > 0 && (
                  <span className="dash-nav-badge">{upcomingBookings.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="dash-sidebar-bottom">
          <Link to="/" className="dash-back-link">← Back to Rooted</Link>
          <button className="dash-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="dash-main">
        {success && <div className="dash-toast success">{success}</div>}
        {error && <div className="dash-toast error">{error}</div>}

        {/* ── MY FAMILY ─────────────────────────────────────── */}
        {activeTab === 'family' && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>My Family</h2>
              <button className="btn-forest btn-small" onClick={() => { setError(''); setShowAddChild(true); }}>
                + Add Child
              </button>
            </div>

            {children.length === 0 ? (
              <EmptyState
                icon="👶"
                title="No children yet"
                message="Add your first child to get personalised recommendations."
                ctaLabel="Add Child"
                onCta={() => setShowAddChild(true)}
              />
            ) : (
              <div className="children-grid-dash">
                {children.map((child) => {
                  const age = calculateAge(child.dob);
                  const stage = getStage(age.years, age.months);
                  return (
                    <div key={child.id} className="child-card-dash">
                      <div className="child-card-top">
                        <Avatar name={child.name} size={48} style={{ background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)', color: '#fff', flexShrink: 0 }} />
                        <div className="child-card-info">
                          <h3>{child.name}</h3>
                          <div className="child-card-meta">
                            <span className="child-age-text">
                              {age.years > 0 ? `${age.years}y ` : ''}{age.months}m
                            </span>
                            <StageBadge stage={stage} />
                          </div>
                        </div>
                      </div>
                      <div className="child-card-actions">
                        <Link to="/resources/milestone-tracker" className="btn-outline btn-small">
                          📊 Milestones
                        </Link>
                        <button className="btn-outline btn-small btn-remove" onClick={() => handleRemoveChild(child.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── SAVED ARTICLES ────────────────────────────────── */}
        {activeTab === 'saved' && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Saved Articles</h2>
              <span className="card-count">{savedArticles.length}</span>
            </div>

            {savedArticles.length === 0 ? (
              <EmptyState
                icon="📌"
                title="Save articles to read later"
                message="Browse our library and bookmark articles that interest you."
                ctaLabel="Browse Articles"
                ctaTo="/articles"
              />
            ) : (
              <div className="saved-grid">
                {savedArticles.map((article) => (
                  <div key={article.slug} className="saved-card">
                    <Link to={`/articles/${article.slug}`} className="saved-card-title">
                      {article.title}
                    </Link>
                    <div className="saved-card-meta">
                      <span className="saved-card-tag">{article.category}</span>
                      <span className="saved-card-read">{article.readTime}</span>
                    </div>
                    <button
                      className="btn-outline btn-small btn-remove"
                      onClick={() => handleRemoveSaved(article.slug)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── MY BOOKINGS ───────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>My Bookings</h2>
            </div>

            {bookings.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No bookings yet"
                message="Connect with a parenting expert for personalised guidance."
                ctaLabel="Browse Experts"
                ctaTo="/experts"
              />
            ) : (
              <>
                {/* Upcoming */}
                {upcomingBookings.length > 0 && (
                  <div className="bookings-group">
                    <h3 className="bookings-group-title">Upcoming</h3>
                    <div className="bookings-list-dash">
                      {upcomingBookings.map((b) => {
                        const expert = expertsData.find((e) => e.id === b.expertId);
                        return (
                          <div key={b.id} className="booking-card-dash">
                            <div className="booking-card-left">
                              <Avatar name={expert?.name || 'Expert'} size={44} style={{ background: 'var(--forest)', color: '#fff', flexShrink: 0 }} />
                              <div>
                                <div className="booking-expert-name">{expert?.name || 'Expert'}</div>
                                <div className="booking-expert-cred">{expert?.credential || ''}</div>
                                <div className="booking-datetime">
                                  {formatDate(b.date)} at {b.time}
                                </div>
                              </div>
                            </div>
                            <span className={`booking-status-badge status-${b.status}`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past */}
                {pastBookings.length > 0 && (
                  <div className="bookings-group">
                    <h3 className="bookings-group-title">Past</h3>
                    <div className="bookings-list-dash">
                      {pastBookings.map((b) => {
                        const expert = expertsData.find((e) => e.id === b.expertId);
                        return (
                          <div key={b.id} className="booking-card-dash past">
                            <div className="booking-card-left">
                              <Avatar name={expert?.name || 'Expert'} size={44} style={{ background: 'var(--stone)', color: '#fff', flexShrink: 0 }} />
                              <div>
                                <div className="booking-expert-name">{expert?.name || 'Expert'}</div>
                                <div className="booking-datetime">{formatDate(b.date)} at {b.time}</div>
                              </div>
                            </div>
                            <div className="booking-card-right">
                              <span className="booking-status-badge status-done">Done</span>
                              {!b.reviewed && (
                                <button className="btn-outline btn-small" onClick={() => handleLeaveReview(b)}>
                                  Leave a Review
                                </button>
                              )}
                              {b.reviewed && (
                                <span className="reviewed-label">✓ Reviewed</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ── RECOMMENDED FOR YOU ───────────────────────────── */}
        {activeTab === 'recommended' && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Recommended For You</h2>
              {youngestStage && (
                <span className="rec-stage-badge" style={{ background: youngestStage.color + '18', color: youngestStage.color }}>
                  Based on {youngestChild?.name}&apos;s age
                </span>
              )}
            </div>

            {!youngestChild ? (
              <EmptyState
                icon="👶"
                title="Add a child to get recommendations"
                message="We'll tailor articles and experts to your child's developmental stage."
                ctaLabel="Add Child"
                onCta={() => { setActiveTab('family'); setShowAddChild(true); }}
              />
            ) : (
              <>
                {/* Articles */}
                <h3 className="rec-subtitle">Articles for the {youngestStage?.label} stage</h3>
                <div className="rec-articles-grid">
                  {recommendedArticles.map((a) => (
                    <Link key={a.slug} to={`/articles/${a.slug}`} className="rec-article-card">
                      <span className="rec-article-tag">{a.category}</span>
                      <h4>{a.title}</h4>
                      <p>{a.excerpt?.slice(0, 100)}…</p>
                      <span className="rec-article-read">{a.readTime}</span>
                    </Link>
                  ))}
                </div>

                {/* Experts */}
                <h3 className="rec-subtitle">Experts for this stage</h3>
                <div className="rec-experts-grid">
                  {recommendedExperts.map((e) => (
                    <Link key={e.id} to={`/experts/${e.id}`} className="rec-expert-card">
                      <div className="rec-expert-top">
                        <Avatar name={e.name} size={44} style={{ background: 'var(--forest)', color: '#fff', flexShrink: 0 }} />
                        <div>
                          <div className="rec-expert-name">{e.name}</div>
                          <div className="rec-expert-spec">{e.speciality}</div>
                        </div>
                      </div>
                      <div className="rec-expert-meta">
                        <span className="rec-expert-rating">★ {e.rating}</span>
                        <span className="rec-expert-price">{e.priceRange}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── SETTINGS ──────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Settings</h2>
            </div>

            <div className="settings-card">
              <h3>Profile</h3>
              <div className="settings-form">
                <label htmlFor="set-name">Name</label>
                <input
                  id="set-name"
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                />

                <label htmlFor="set-email">Email</label>
                <input
                  id="set-email"
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                />

                <button className="btn-forest btn-small" onClick={handleSaveSettings}>
                  Save Changes
                </button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Change Password</h3>
              <div className="settings-form">
                <label htmlFor="set-cur-pw">Current password</label>
                <input id="set-cur-pw" type="password" placeholder="••••••••" />

                <label htmlFor="set-new-pw">New password</label>
                <input id="set-new-pw" type="password" placeholder="Min. 8 characters" />

                <label htmlFor="set-conf-pw">Confirm new password</label>
                <input id="set-conf-pw" type="password" placeholder="Re-enter password" />

                <button className="btn-forest btn-small">Update Password</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Notifications</h3>
              <div className="settings-toggle-row">
                <div>
                  <div className="settings-toggle-label">Weekly Digest</div>
                  <div className="settings-toggle-desc">
                    Get a curated summary of articles, tips, and milestones every week.
                  </div>
                </div>
                <button
                  className={`toggle-switch ${digestOn ? 'on' : ''}`}
                  onClick={() => setDigestOn(!digestOn)}
                  aria-label="Toggle weekly digest"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Subscription</h3>
              <div className="sub-info">
                <div className="sub-plan-row">
                  <span className="sub-plan-label">Current Plan</span>
                  <span className={`sub-plan-badge tier-${subTier}`}>
                    {subTier === 'premium' ? '🌟 Premium' : 'Free'}
                  </span>
                </div>
                {subRenewal && (
                  <div className="sub-plan-row">
                    <span className="sub-plan-label">
                      {subCancelAtEnd ? 'Expires on' : 'Renews on'}
                    </span>
                    <span className="sub-plan-date">
                      {new Date(subRenewal).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {subCancelAtEnd && subTier === 'premium' && (
                  <div className="sub-cancel-notice">
                    Your subscription will end on the date above. You'll still have Premium access until then.
                  </div>
                )}
              </div>

              <div className="sub-actions">
                {subTier === 'free' ? (
                  <button
                    className="btn-forest btn-small"
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                  >
                    {upgradeLoading ? 'Redirecting…' : '✨ Upgrade to Premium'}
                  </button>
                ) : (
                  <>
                    {!subCancelAtEnd && (
                      <>
                        {!showCancelSubConfirm ? (
                          <button
                            className="btn-outline btn-small btn-remove"
                            onClick={() => setShowCancelSubConfirm(true)}
                          >
                            Cancel Subscription
                          </button>
                        ) : (
                          <div className="confirm-dialog">
                            <p>Are you sure? Your Premium benefits will remain until the end of your current billing period.</p>
                            <div className="confirm-actions">
                              <button
                                className="btn-outline btn-small"
                                onClick={() => setShowCancelSubConfirm(false)}
                                disabled={cancelSubLoading}
                              >
                                Keep Premium
                              </button>
                              <button
                                className="btn-danger btn-small"
                                onClick={handleCancelSubscription}
                                disabled={cancelSubLoading}
                              >
                                {cancelSubLoading ? 'Cancelling…' : 'Yes, cancel'}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="settings-card danger-zone">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              {!showDeleteConfirm ? (
                <button className="btn-danger btn-small" onClick={() => setShowDeleteConfirm(true)}>
                  Delete My Account
                </button>
              ) : (
                <ConfirmDialog
                  message="Are you sure you want to delete your account? All data will be permanently removed."
                  onConfirm={handleDeleteAccount}
                  onCancel={() => setShowDeleteConfirm(false)}
                  loading={deleteLoading}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Add Child Modal ─────────────────────────────────── */}
      {showAddChild && (
        <Modal title="Add Child" onClose={() => { setShowAddChild(false); setError(''); }}>
          {error && <div className="dash-toast error" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="modal-form">
            <label htmlFor="modal-child-name">Name</label>
            <input
              id="modal-child-name"
              type="text"
              placeholder="Child's name"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
            />
            <label htmlFor="modal-child-dob">Date of birth</label>
            <input
              id="modal-child-dob"
              type="date"
              value={newChildDOB}
              onChange={(e) => setNewChildDOB(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <button className="btn-forest" onClick={handleAddChild}>Add Child</button>
          </div>
        </Modal>
      )}

      {/* ── Review Modal ────────────────────────────────────── */}
      {reviewBooking && (
        <Modal title="Leave a Review" onClose={() => setReviewBooking(null)}>
          <div className="modal-form">
            <div className="review-stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`review-star ${star <= reviewRating ? 'filled' : ''}`}
                  onClick={() => setReviewRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <label htmlFor="review-text">Your review</label>
            <textarea
              id="review-text"
              rows={4}
              placeholder="Share your experience…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="btn-forest" onClick={handleSubmitReview}>Submit Review</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
