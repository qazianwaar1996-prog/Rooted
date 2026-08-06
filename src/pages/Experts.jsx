import { useState } from 'react';
import { Link } from 'react-router-dom';
import expertsData from '../data/experts.json';
import '../styles/app.css';

const categories = [
  'All', 'Child Psychologist', 'Sleep Coach', 'Parenting Coach', 'Nutritionist', 'Digital Wellness'
];

export default function Experts() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = expertsData.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(search.toLowerCase()) ||
      expert.speciality.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || expert.speciality === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="experts-page">
      <header className="experts-header">
        <h1>Verified Parenting Experts</h1>
        <p>Connect with certified professionals who understand real parenting challenges.</p>
      </header>

      {/* Search */}
      <div className="experts-search-wrapper">
        <input
          type="text"
          className="experts-search"
          placeholder="Search by name or speciality"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search experts"
        />
      </div>

      {/* Filter tabs */}
      <nav className="filter-tabs" aria-label="Expert categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Grid */}
      <section className="experts-grid" aria-label="Experts">
        {filtered.map(expert => (
          <Link to={`/experts/${expert.id}`} key={expert.id} className="expert-card">
            <div className="expert-card-top">
              <div className="expert-avatar" aria-label={`${expert.name} avatar`}>
                {expert.avatar}
              </div>
              <div className="expert-header-info">
                <h2 className="expert-name">{expert.name}</h2>
                <span className="expert-credential">{expert.credential}</span>
              </div>
            </div>

            <div className="expert-tags">
              <span className="expert-speciality-tag">{expert.speciality}</span>
            </div>

            <div className="expert-meta-row">
              <span className="expert-rating">
                <span aria-label={`${expert.rating} out of 5 stars`}>★</span> {expert.rating}
                <span className="expert-review-count">({expert.reviews} reviews)</span>
              </span>
              <span className={`expert-availability-dot ${expert.available ? 'available' : ''}`} aria-label={expert.available ? 'Available' : 'Not available'} />
              <span className="expert-availability-text">{expert.available ? 'Available' : 'Booked'}</span>
            </div>

            <div className="expert-languages">
              {expert.languages.join(' · ')}
            </div>
            <div className="expert-price">{expert.priceRange}</div>

            <span className="expert-view-btn">View Profile →</span>
          </Link>
        ))}
      </section>

      {filtered.length === 0 && (
        <p className="experts-empty">No experts match your search. Try a different filter or name.</p>
      )}
    </div>
  );
}
