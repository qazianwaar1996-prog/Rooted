import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import expertsData from '../data/experts.json';
import SEOHead from '../components/SEOHead';
import { personSchema, breadcrumbSchema } from '../components/StructuredData';
import '../styles/app.css';

export default function ExpertProfile() {
  const { id } = useParams();
  const expert = expertsData.find(e => String(e.id) === String(id));
  const [showBooking, setShowBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({ name: '', email: '', date: '', time: '', childAge: '', helpWith: '' });

  if (!expert) {
    return (
      <div style={{ padding: '120px 40px', textAlign: 'center', maxWidth: 1280, margin: '0 auto' }}>
        <SEOHead title="Expert Not Found — Rooted" noIndex />
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>Expert Not Found</h1>
        <Link to="/experts" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Back to Experts</Link>
      </div>
    );
  }

  const profileUrl = `https://rooted-parenting.com/experts/${expert.id}`;

  const handleBooking = (e) => {
    e.preventDefault();
    setStep(s => s + 1);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <div className="expert-profile-page">
      <SEOHead
        title={`${expert.name} — ${expert.speciality} | Rooted`}
        description={`${expert.name} — ${expert.credential}. ${expert.bio.slice(0, 150)}… Book a 1-on-1 session for personalised parenting guidance.`}
        ogType="profile"
        canonicalUrl={profileUrl}
        keywords={`${expert.name}, ${expert.speciality}, parenting expert, child psychologist, sleep coach`}
      >
        <script type="application/ld+json">{JSON.stringify(personSchema({
          name: expert.name,
          jobTitle: expert.speciality,
          description: expert.bio,
          url: profileUrl,
        }))}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema([
          { name: 'Rooted', url: 'https://rooted-parenting.com' },
          { name: 'Experts', url: 'https://rooted-parenting.com/experts' },
          { name: expert.name, url: profileUrl },
        ]))}</script>
      </SEOHead>

      {/* Hero */}
      <header className="expert-hero">
        <div className="expert-hero-avatar" aria-label={`${expert.name} avatar`}>
          {expert.avatar}
        </div>
        <div className="expert-hero-info">
          <h1>{expert.name}</h1>
          <p className="expert-credential">{expert.credential}</p>
          <div className="expert-hero-meta">
            <span className="expert-hero-speciality">{expert.speciality}</span>
            <span className="expert-hero-rating">★ {expert.rating} <span style={{ color: 'var(--soft)', fontWeight: 500 }}>({expert.reviews} reviews)</span></span>
            <span className="expert-hero-sessions">{expert.sessions.toLocaleString()} sessions completed</span>
            <span className="expert-hero-response">Response time: {expert.responseTime}</span>
          </div>
          <div className="expert-hero-tags">
            {expert.languages.map(lang => <span key={lang} className="language-badge">{lang}</span>)}
            {expert.sessionFormats.map(fmt => <span key={fmt} className="format-badge">{fmt}</span>)}
          </div>
        </div>
      </header>

      <div className="expert-layout">
        <div className="expert-main">
          {/* About */}
          <section className="expert-section" aria-label="About">
            <h2>About</h2>
            <p className="expert-bio">{expert.bio}</p>
          </section>

          {/* Specialities */}
          <section className="expert-section" aria-label="Specialities">
            <h2>Specialities</h2>
            <div className="specialities-grid">
              {expert.specialities.map(s => (
                <div key={s} className="speciality-item">{s}</div>
              ))}
            </div>
          </section>

          {/* Session formats */}
          <section className="expert-section" aria-label="Session formats">
            <h2>Session Formats</h2>
            <div className="session-formats">
              {expert.sessionFormats.map(fmt => (
                <span key={fmt} className="session-format-badge">{fmt}</span>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="expert-section" aria-label="Reviews">
            <h2>Reviews</h2>
            <div className="reviews-breakdown">
              <div className="rating-breakdown">
                <div className="rating-breakdown-score">
                  <span className="rating-breakdown-number">{expert.rating}</span>
                  <span className="rating-breakdown-label">out of 5</span>
                </div>
                <div className="rating-breakdown-bars">
                  {[5, 4, 3, 2, 1].map(stars => (
                    <div key={stars} className="rating-breakdown-row">
                      <span className="rating-breakdown-stars">{'★'.repeat(stars)}</span>
                      <div className="rating-breakdown-bar-track">
                        <div className="rating-breakdown-bar-fill" style={{ width: stars >= Math.round(expert.rating) ? '80%' : '20%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="reviews-list">
              {expert.reviewsData.map((rev, i) => (
                <article key={i} className="review-card">
                  <div className="review-header">
                    <span className="review-parent">{rev.parent}</span>
                    <time className="review-date">{rev.date}</time>
                  </div>
                  <div className="review-stars" aria-label={`${rev.rating} stars`}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="review-text">"{rev.text}"</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky booking sidebar */}
        <aside className="expert-sidebar" aria-label="Booking">
          <div className="booking-card">
            <h3>Book a Session</h3>
            <div className="booking-detail">
              <span className="booking-detail-label">Session Price</span>
              <span className="booking-detail-value">{expert.priceRange}</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Duration</span>
              <span className="booking-detail-value">50 min</span>
            </div>
            <div className="booking-detail">
              <span className="booking-detail-label">Response Time</span>
              <span className="booking-detail-value">{expert.responseTime}</span>
            </div>
            <button className="btn-forest booking-cta" onClick={() => { setShowBooking(true); setStep(1); setBooking({ name: '', email: '', date: '', time: '', childAge: '', helpWith: '' }); }}>
              Book a Session
            </button>
            <p className="booking-note">You'll receive a payment link by email within 24 hours.</p>
          </div>
        </aside>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Book a session" onClick={e => { if (e.target.classList.contains('modal-overlay')) setShowBooking(false); }}>
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h2>Book with {expert.name}</h2>
              <button className="modal-close" onClick={() => setShowBooking(false)} aria-label="Close">×</button>
            </div>

            <div className="booking-steps">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`booking-step ${step >= s ? 'completed' : step === s ? 'active' : ''}`}>
                  <span className="booking-step-number">{s}</span>
                </div>
              ))}
            </div>
            <div className="booking-step-labels">
              <span>Date</span><span>Time</span><span>Details</span><span>Confirm</span>
            </div>

            <form onSubmit={step === 3 ? handleConfirm : handleBooking} className="booking-form">
              {step === 1 && (
                <div className="booking-step-content">
                  <h3>Select a Date</h3>
                  <input
                    type="date"
                    value={booking.date}
                    onChange={e => setBooking({ ...booking, date: e.target.value })}
                    className="booking-date-input"
                    required
                  />
                  <button type="submit" className="btn-forest" disabled={!booking.date}>Continue</button>
                </div>
              )}

              {step === 2 && (
                <div className="booking-step-content">
                  <h3>Select a Time Slot</h3>
                  <div className="time-slots">
                    {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'].map(t => (
                      <label key={t} className={`time-slot ${booking.time === t ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="time"
                          value={t}
                          checked={booking.time === t}
                          onChange={e => setBooking({ ...booking, time: e.target.value })}
                          required
                        />
                        <span className="time-slot-label">{t}</span>
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="btn-forest" disabled={!booking.time}>Continue</button>
                </div>
              )}

              {step === 3 && (
                <div className="booking-step-content">
                  <h3>Your Details</h3>
                  <label>Your Name</label>
                  <input type="text" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} placeholder="Your full name" required />
                  <label>Email</label>
                  <input type="email" value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} placeholder="you@example.com" required />
                  <label>Child's Age</label>
                  <input type="text" value={booking.childAge} onChange={e => setBooking({ ...booking, childAge: e.target.value })} placeholder="e.g. 4 years" />
                  <label>What do you need help with?</label>
                  <textarea value={booking.helpWith} onChange={e => setBooking({ ...booking, helpWith: e.target.value })} rows={3} placeholder="Brief description of your situation..." />
                  <button type="submit" className="btn-forest">Confirm Booking</button>
                </div>
              )}

              {step === 4 && (
                <div className="booking-confirmation">
                  <h3>Booking Confirmed</h3>
                  <p>Thank you, <strong>{booking.name}</strong>. Your session with <strong>{expert.name}</strong> is confirmed for <strong>{booking.date}</strong> at <strong>{booking.time}</strong>.</p>
                  <p>You'll receive a payment link by email within 24 hours.</p>
                  <button className="btn-forest" onClick={() => setShowBooking(false)}>Close</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
