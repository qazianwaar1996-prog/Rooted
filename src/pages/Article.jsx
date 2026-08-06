import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import articlesData from '../data/articles.json';
import '../styles/app.css';

export default function ArticlePage() {
  const { slug } = useParams();
  const article = articlesData.find(a => a.slug === slug);
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>Article Not Found</h1>
        <Link to="/articles" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Back to Articles</Link>
      </div>
    );
  }

  const related = articlesData
    .filter(a => a.slug !== article.slug && (a.category === article.category || a.tags.some(t => article.tags.includes(t))))
    .slice(0, 3);

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="article-page">
      <article className="article-content">
        {/* Article hero */}
        <header className="article-hero">
          <a href="#" className="article-hero-tag" style={{ color: getCategoryColor(article.category) }}>
            {article.category}
          </a>
          <h1 className="article-hero-title">{article.title}</h1>
          <div className="article-author-strip">
            <div className="author-avatar-large" aria-label={`${article.author.name} avatar`}>
              {article.author.avatar}
            </div>
            <div className="author-strip-info">
              <span className="author-strip-name">{article.author.name}</span>
              <span className="author-strip-credential">{article.author.credential}</span>
            </div>
            <time className="author-strip-date" dateTime={article.datePublished}>
              {formatDate(article.datePublished)}
            </time>
            <span className="author-strip-read">{article.readTime} read</span>
          </div>
        </header>

        {/* Article body */}
        <div className="article-body">
          <h2>Why This Matters</h2>
          <p>
            Parenting in 2026 requires navigating a landscape that previous generations could not have imagined. From artificial intelligence to evolving social dynamics, the challenges parents face today are both familiar and entirely new. This guide offers a practical framework for understanding how these shifts impact your family.
          </p>

          <h3>The Research Behind the Approach</h3>
          <p>
            Recent studies in developmental psychology have shown that children develop resilience not by avoiding stress, but by learning to respond to it effectively. This means the goal of parenting is not to eliminate all difficulty, but to equip children with the emotional tools to navigate it.
          </p>
          <blockquote>
            "Children don't learn resilience from a perfect environment. They learn it from relationships that help them process imperfection."
          </blockquote>
          <p>
            The implications of this research extend beyond the individual child. When families adopt these approaches collectively, the effects ripple through communities, schools, and ultimately society.
          </p>

          <h3>Key Principles</h3>
          <ul>
            <li><strong>Consistency over intensity.</strong> Small, predictable actions create more security than occasional grand gestures.</li>
            <li><strong>Emotional literacy comes first.</strong> Before problem-solving, children need to recognize and name their feelings.</li>
            <li><strong>Autonomy within boundaries.</strong> Children thrive when they have meaningful choices within a safe structure.</li>
            <li><strong>Repair after rupture.</strong> What matters most is not avoiding mistakes, but how parents respond afterward.</li>
          </ul>

          <h2>Putting It Into Practice</h2>
          <p>
            The strategies outlined here are designed to be implemented gradually. You don't need to adopt everything at once. Start with one principle that resonates, practice it consistently for a few weeks, and observe the changes in your family dynamics.
          </p>
          <p>
            Remember that parenting is not about perfection. It's about presence, intention, and the willingness to grow alongside your children. Every day offers a new opportunity to show up with the kind of care that builds lasting resilience.
          </p>

          <h3>When to Seek Additional Support</h3>
          <p>
            If you notice persistent patterns that concern you—whether in behavior, emotional regulation, or social interaction—reaching out to a professional is not a failure but a strength. Early intervention has been shown to significantly improve outcomes.
          </p>
        </div>

        {/* Author bio */}
        <aside className="author-bio">
          <div className="author-bio-avatar" aria-label={`${article.author.name} avatar`}>
            {article.author.avatar}
          </div>
          <div className="author-bio-body">
            <h3>About {article.author.name}</h3>
            <p>
              {article.author.name} is a {article.author.credential.toLowerCase()} dedicated to evidence-based parenting support. Their work combines clinical research with practical family guidance.
            </p>
          </div>
        </aside>

        {/* Share buttons */}
        <div className="share-buttons">
          <span className="share-label">Share this article</span>
          <a href="#" className="share-btn share-twitter" aria-label="Share on Twitter">Twitter</a>
          <a href="#" className="share-btn share-facebook" aria-label="Share on Facebook">Facebook</a>
          <button className="share-btn share-copy" onClick={handleCopy} aria-label="Copy link">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </article>

      {/* Sticky sidebar */}
      <aside className="article-sidebar" aria-label="Article sidebar">
        {/* Table of contents */}
        <nav className="toc-card" aria-label="Table of contents">
          <h3>In This Article</h3>
          <ul>
            <li><a href="#">Why This Matters</a></li>
            <li><a href="#">The Research Behind the Approach</a></li>
            <li><a href="#">Key Principles</a></li>
            <li><a href="#">Putting It Into Practice</a></li>
            <li><a href="#">When to Seek Additional Support</a></li>
          </ul>
        </nav>

        {/* Email capture */}
        <div className="toc-email-card">
          <h3>Parenting support, straight to your inbox</h3>
          <p>Get weekly expert advice, new guides, and community highlights.</p>
          <form onSubmit={e => { e.preventDefault(); }} className="toc-email-form">
            <input type="email" placeholder="Enter your email" className="toc-email-input" />
            <button type="submit" className="btn-amber">Subscribe</button>
          </form>
          <p className="toc-email-note">No spam. Unsubscribe anytime.</p>
        </div>

        {/* Related articles */}
        <div className="toc-related">
          <h3>Related Articles</h3>
          <div className="related-list">
            {related.map(rel => (
              <Link to={`/articles/${rel.slug}`} key={rel.slug} className="related-item">
                <span className="related-item-tag" style={{ color: getCategoryColor(rel.category) }}>
                  {rel.category}
                </span>
                <h4 className="related-item-title">{rel.title}</h4>
                <span className="related-item-read">{rel.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
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
