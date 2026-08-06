import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/app.css';

export default function Home() {
  return (
    <div className="page-wrap">
      <div className="main-area">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-trust-badge">
            <span className="trust-heart">🤍</span>
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
              <span>👩</span>
              <span>👨</span>
              <span>👩</span>
              <span>👨</span>
              <span>👩</span>
            </div>
            <div className="proof-text">
              <div className="proof-stars">★★★★★</div>
              <div className="proof-label">4.9/5 from 2,300+ parents</div>
            </div>
          </div>
        </div>

        {/* Hero photo + floating cards */}
        <div className="hero-photo">
          <img
            className="hero-photo-img"
            src="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=900&q=85"
            alt="Mother and baby sharing a warm moment"
          />
          <div className="leaf-deco" />

          <div className="article-cards">
            <a href="#" className="art-card">
              <img className="art-thumb" src="https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=120&q=80" alt="Child" />
              <div className="art-info">
                <div className="art-tag">New Article</div>
                <div className="art-title">Helping Kids Manage Big Emotions</div>
                <div className="art-read">7 min read</div>
              </div>
            </a>
            <a href="#" className="art-card">
              <img className="art-thumb" src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=120&q=80" alt="Parents" />
              <div className="art-info">
                <div className="art-tag">Parent Story</div>
                <div className="art-title">From Overwhelmed to Confident</div>
                <div className="art-read">10 min read</div>
              </div>
            </a>
            <a href="#" className="art-card">
              <img className="art-thumb" src="https://images.unsplash.com/photo-1466781782265-5fe11bb0b8c3?w=120&q=80" alt="Growth" />
              <div className="art-info">
                <div className="art-tag">Guide</div>
                <div className="art-title">Positive Discipline That Works</div>
                <div className="art-read">12 min read</div>
              </div>
            </a>
            <Link to="/articles" className="art-view-all">View all articles →</Link>
          </div>
        </div>
      </section>

      {/* Journey strip */}
      <section className="journey-strip">
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
            <div key={step.name} className={`j-step ${step.active ? 'active' : ''}`}>
              <div className="j-node">{step.icon}</div>
              <div className="j-name">{step.name}</div>
              <div className="j-range" dangerouslySetInnerHTML={{ __html: step.range }} />
            </div>
          ))}
        </div>
      </section>

      {/* Feature icons */}
      <section className="features-strip">
        {[
          { icon: '🌿', name: 'Expert Guidance', desc: 'Advice from parenting experts and child psychologists.' },
          { icon: '👨‍👩‍👧', name: 'Real Community', desc: 'Connect with parents who get it. You\'re not alone.' },
          { icon: '🗂️', name: 'Practical Tools', desc: 'Printables, checklists and tools for everyday parenting.' },
          { icon: '🔬', name: 'Evidence-Based', desc: 'Trusted by experts. Backed by research.' },
          { icon: '🎓', name: 'Courses & Workshops', desc: 'Learn at your pace with step-by-step courses.' },
          { icon: '📚', name: 'Resources Library', desc: 'Articles, guides and downloads at your fingertips.' },
        ].map((feat) => (
          <a key={feat.name} href="#" className="feat-item">
            <div className="feat-icon">{feat.icon}</div>
            <h3 className="feat-name">{feat.name}</h3>
            <p className="feat-desc">{feat.desc}</p>
          </a>
        ))}
      </section>
      </div>
      <Sidebar />
    </div>
  );
}
