import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import articlesData from '../data/articles.json';
import SEOHead from '../components/SEOHead';
import { articleSchema, breadcrumbSchema } from '../components/StructuredData';
import '../styles/app.css';

const ARTICLE_OG_IMAGES = {
  'screen-time-by-age-2026-complete-guide': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80',
  'how-to-talk-to-your-child-about-ai': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
  'why-your-toddler-says-no-to-everything': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
  'toddler-milestones-at-18-months-whats-normal': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&q=80',
  'why-your-child-wont-sleep-and-what-actually-works': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80',
  'discipline-without-yelling-7-techniques-that-work': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80',
  'raising-emotionally-resilient-kids-in-2026': 'https://images.unsplash.com/photo-1472162072942-ca514feb0603?w=1200&q=80',
  'signs-your-child-has-anxiety-and-what-to-do': 'https://images.unsplash.com/photo-1466781782265-5fe11bb0b8c3?w=1200&q=80',
  'how-to-raise-kids-who-are-smarter-than-ai': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80',
  'honest-screen-time-rules-for-2026': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
  'age-by-age-guide-to-child-development-0-12': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
  'what-to-do-when-your-child-has-tantrums-in-public': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&q=80',
};

const TAG_KEYWORDS = {
  'Screen Time': 'screen time kids age, screen time recommendations 2026',
  'AI': 'raising kids AI age, AI and children',
  'Sleep': 'sleep training toddler, baby sleep tips',
  'Discipline': 'positive discipline, discipline without yelling',
  'Development': 'toddler milestones, child development stages',
  'Milestones': 'toddler milestones, 18 month milestones',
  'Behavior': 'toddler behavior, child behavior management',
  'Anxiety': 'child anxiety signs, childhood anxiety symptoms',
  'Teen': 'teen parenting tips, adolescent mental health',
  'Resilience': 'raising resilient kids, emotional resilience children',
  'Tantrums': 'toddler tantrums, public tantrum tips',
};

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

  const articleUrl = `https://rooted-parenting.com/articles/${article.slug}`;
  const ogImage = ARTICLE_OG_IMAGES[article.slug] || 'https://rooted-parenting.com/og-default.jpg';
  const keywordList = article.tags.map(t => TAG_KEYWORDS[t] || t.toLowerCase()).join(', ');

  return (
    <div className="article-page">
      <SEOHead
        title={article.title}
        description={article.excerpt}
        ogImage={ogImage}
        ogType="article"
        canonicalUrl={articleUrl}
        keywords={`${keywordList}, parenting tips 2026`}
      >
        <script type="application/ld+json">{JSON.stringify(articleSchema({
          title: article.title,
          description: article.excerpt,
          authorName: article.author.name,
          datePublished: article.datePublished,
          imageUrl: ogImage,
          url: articleUrl,
        }))}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema([
          { name: 'Rooted', url: 'https://rooted-parenting.com' },
          { name: 'Articles', url: 'https://rooted-parenting.com/articles' },
          { name: article.title, url: articleUrl },
        ]))}</script>
        <meta name="author" content={article.author.name} />
        <meta property="article:published_time" content={article.datePublished} />
        <meta property="article:author" content={article.author.name} />
        {article.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
      </SEOHead>

      <article className="article-content">
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

        <div className="share-buttons">
          <span className="share-label">Share this article</span>
          <a href="#" className="share-btn share-twitter" aria-label="Share on Twitter">Twitter</a>
          <a href="#" className="share-btn share-facebook" aria-label="Share on Facebook">Facebook</a>
          <button className="share-btn share-copy" onClick={handleCopy} aria-label="Copy link">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </article>

      <aside className="article-sidebar" aria-label="Article sidebar">
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

        <div className="toc-email-card">
          <h3>Parenting support, straight to your inbox</h3>
          <p>Get weekly expert advice, new guides, and community highlights.</p>
          <form onSubmit={e => { e.preventDefault(); }} className="toc-email-form">
            <input type="email" placeholder="Enter your email" className="toc-email-input" />
            <button type="submit" className="btn-amber">Subscribe</button>
          </form>
          <p className="toc-email-note">No spam. Unsubscribe anytime.</p>
        </div>

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
