import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Sidebar from '../components/Sidebar';
import SEOHead from '../components/SEOHead';
import { JsonLd, organizationSchema } from '../components/StructuredData';
import '../styles/app.css';

export default function Home() {
  const [activeStage, setActiveStage] = useState('Toddler');
  return (
    <div className="page-wrap">
      <SEOHead
        title="Rooted — Growing Together. Raising Kind Humans. | Parenting Tips 2026"
        description="Evidence-based parenting guidance for every stage. Expert articles on toddler milestones, child anxiety signs, sleep training, positive discipline, and raising kids in the AI age. Join 75,000+ parents."
        keywords="parenting tips 2026, toddler milestones, child anxiety signs, sleep training toddler, positive discipline, raising kids AI age, screen time kids age"
        canonicalUrl="https://rooted-parenting.com"
      >
        <JsonLd data={organizationSchema()} />
        <script type="application/ld+json">{JSON.stringify({
          '@context':'https://schema.org',
          '@type':'WebSite',
          name:'Rooted',
          url:'https://rooted-parenting.com',
          potentialAction:{'@type':'SearchAction',target:'https://rooted-parenting.com/articles?q={search_term_string}', 'query-input':'required name=search_term_string'},
        })}</script>
      </SEOHead>

      <div className="main-area">
      <section className="hero">
        <div className="hero-photo" data-reveal="fade">
          <img className="hero-photo-img" loading="lazy"
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1800&q=85&auto=format&fit=crop"
            alt="Warm family photograph — parent and children sharing a joyful moment together at home, bathed in golden light" />
          <div className="hero-photo-overlay" aria-hidden="true" />
          <div className="hero-warm-glow" aria-hidden="true" />
        </div>

        <div className="hero-left" data-reveal="up">
          <div className="hero-trust-badge">
            <span className="trust-heart" aria-hidden="true" />
            <span className="trust-text">Trusted by 75,000+ parents worldwide</span>
          </div>
          <h1>
            Parenting with<br />
            <span className="amber">Purpose.</span><br />
            Growing Stronger<br />Families.
          </h1>
          <p className="hero-body">
            Evidence-based guidance, real parent stories, and a supportive community for every stage of your parenting journey.
          </p>
          <div className="hero-btns">
            <a href="#email" className="btn-forest">Join Our Community</a>
            <Link to="/articles" className="btn-outline">Explore Articles</Link>
          </div>
          <div className="hero-social-proof">
            <div className="proof-avatars">
              <span className="proof-avatar">A</span>
              <span className="proof-avatar">J</span>
              <span className="proof-avatar">M</span>
              <span className="proof-avatar">S</span>
              <span className="proof-avatar">R</span>
            </div>
            <div className="proof-text">
              <div className="proof-stars">★★★★★</div>
              <div className="proof-label">4.9/5 from 2,300+ parents</div>
            </div>
          </div>
        </div>

        <div className="article-cards" aria-label="Featured articles">
          <Link to="/articles/screen-time-by-age-2026-complete-guide" className="art-card">
              <div className="art-thumb">
                <img loading="lazy" src="https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=200&q=85" alt="Child playing with educational toy" />
              </div>
              <div className="art-info">
                <div className="art-tag">New Article</div>
                <div className="art-title">Screen Time by Age: 2026 Guide</div>
                <div className="art-read"><span className="art-dot" aria-hidden="true" />12 min read</div>
              </div>
            </Link>
            <Link to="/articles/discipline-without-yelling-7-techniques-that-work" className="art-card">
              <div className="art-thumb">
                <img loading="lazy" src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&q=85" alt="Happy family spending quality time together" />
              </div>
              <div className="art-info">
                <div className="art-tag">Parent Story</div>
                <div className="art-title">Positive Discipline That Works</div>
                <div className="art-read"><span className="art-dot" aria-hidden="true" />9 min read</div>
              </div>
            </Link>
            <Link to="/articles/signs-your-child-has-anxiety-and-what-to-do" className="art-card">
              <div className="art-thumb">
                <img loading="lazy" src="https://images.unsplash.com/photo-1466781782265-5fe11bb0b8c3?w=200&q=85" alt="Child learning and growing with nature-inspired activities" />
              </div>
              <div className="art-info">
                <div className="art-tag">Guide</div>
                <div className="art-title">Child Anxiety Signs & What To Do</div>
                <div className="art-read"><span className="art-dot" aria-hidden="true" />13 min read</div>
              </div>
            </Link>
            <Link to="/articles" className="art-view-all">View all articles →</Link>
        </div>
      </section>

      <section className="journey-strip" data-reveal="up">
        <div className="journey-label-col">
          <h2 className="journey-title">Your Parenting Journey</h2>
          <p className="journey-sub">Guidance and support for every stage</p>
        </div>
        <div className="journey-track">
          {[
            { icon: '🤰', name: 'Pregnancy', range: 'Preparing for\nyour little one' },
            { icon: '🍼', name: 'Newborn', range: '0–12 months' },
            { icon: '🧸', name: 'Toddler', range: '1–3 years', active: true },
            { icon: '✏️', name: 'Preschool', range: '3–5 years' },
            { icon: '🎒', name: 'School Age', range: '6–12 years' },
            { icon: '🎓', name: 'Teen', range: '13+ years' },
          ].map((step) => (
            <button
              key={step.name}
              type="button"
              className={`j-step ${activeStage === step.name ? 'active' : ''}`}
              onClick={() => setActiveStage(step.name)}
              aria-pressed={activeStage === step.name}
              aria-label={`${step.name} stage — ${step.range.replace(/\s*\n\s*/g, ' ')}`}
            >
              <span className="j-node" aria-hidden="true">{step.icon}</span>
              <span className="j-name">{step.name}</span>
              <span className="j-range" dangerouslySetInnerHTML={{ __html: step.range }} />
            </button>
          ))}
        </div>
      </section>

      <section className="features-strip">
        {[
          { icon: '🌿', name: 'Expert Guidance', desc: 'Advice from parenting experts and child psychologists.' },
          { icon: '👨‍👩‍👧', name: 'Real Community', desc: "Connect with parents who get it. You're not alone." },
          { icon: '🗂️', name: 'Practical Tools', desc: 'Printables, checklists and tools for everyday parenting.' },
          { icon: '🔬', name: 'Evidence-Based', desc: 'Trusted by experts. Backed by research.' },
          { icon: '🎓', name: 'Courses & Workshops', desc: 'Learn at your pace with step-by-step courses.' },
          { icon: '📚', name: 'Resources Library', desc: 'Articles, guides and downloads at your fingertips.' },
        ].map((feat) => (
          <Link key={feat.name} to="/resources" className="feat-item" data-reveal="fade">
            <div className="feat-icon" aria-hidden="true">{feat.icon}</div>
            <h3 className="feat-name">{feat.name}</h3>
            <p className="feat-desc">{feat.desc}</p>
            <span className="feat-link" aria-hidden="true">Explore <span className="feat-arrow">→</span></span>
          </Link>
        ))}
      </section>
      </div>
      <Sidebar />
    </div>
  );
}
