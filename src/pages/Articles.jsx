import { useState } from 'react';
import { Link } from 'react-router-dom';
import articlesData from '../data/articles.json';
import '../styles/app.css';

const categories = [
  'All', 'Newborn', 'Toddler', 'Preschool', 'School Age', 'Teen', 'AI Age'
];

export default function Articles() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = activeCategory === 'All'
    ? articlesData
    : articlesData.filter(a => a.category === activeCategory);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="articles-page">
      {/* Page header */}
      <header className="articles-header">
        <h1>Expert Parenting Guides</h1>
        <p>Evidence-based articles, real parent stories, and practical guidance for every stage of your parenting journey.</p>
      </header>

      {/* Filter tabs */}
      <nav className="filter-tabs" aria-label="Article categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Article grid */}
      <section className="articles-grid" aria-label="Articles">
        {visible.map(article => (
          <Link to={`/articles/${article.slug}`} key={article.slug} className="article-card">
            <div className="article-card-tag" style={{ color: getCategoryColor(article.category) }}>
              {article.category}
            </div>
            <h2 className="article-card-title">{article.title}</h2>
            <p className="article-card-excerpt">{article.excerpt}</p>
            <div className="article-card-meta">
              <span className="author-avatar" aria-label={`${article.author.name} avatar`}>
                {article.author.avatar}
              </span>
              <div className="author-info">
                <span className="author-name">{article.author.name}</span>
                <span className="author-credential">{article.author.credential}</span>
              </div>
              <span className="article-read-time">{article.readTime}</span>
              <time className="article-date" dateTime={article.datePublished}>
                {formatDate(article.datePublished)}
              </time>
            </div>
          </Link>
        ))}
      </section>

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="load-more-wrapper">
          <button
            className="btn-forest"
            onClick={() => setVisibleCount(c => c + 3)}
          >
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
}

function getCategoryColor(category) {
  const map = {
    'Newborn': '#4A7C59',
    'Toddler': '#B8792A',
    'Preschool': '#6B4C8A',
    'School Age': '#2A4A1E',
    'Teen': '#8B5E3C',
    'AI Age': '#C28B3A',
    'All': '#2A4A1E'
  };
  return map[category] || '#B8792A';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
