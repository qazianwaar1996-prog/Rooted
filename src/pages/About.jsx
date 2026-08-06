import SEOHead from '../components/SEOHead';

export default function About() {
  return (
    <section style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <SEOHead
        title="About Rooted — Evidence-Based Parenting Platform"
        description="Rooted is a parenting platform built by parents and child development experts. We provide evidence-based articles, milestone trackers, expert sessions, and a supportive community for every stage."
        keywords="parenting platform, evidence-based parenting, parenting community, child development experts"
        canonicalUrl="https://rooted-parenting.com/about"
      />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '2.5rem', color: 'var(--forest)' }}>About Rooted</h1>
      <p style={{ color: 'var(--mid)', marginTop: '16px', lineHeight: 1.7, maxWidth: 680 }}>
        Rooted was built for parents, by parents — in collaboration with certified child psychologists, pediatricians, and early childhood educators. We believe every parent deserves access to evidence-based guidance, practical tools, and a community that understands the real challenges of raising children in 2026 and beyond. From toddler milestones and sleep training to managing screen time and supporting anxious children, our articles, tools, and expert sessions are designed to help you parent with confidence.
      </p>
    </section>
  );
}
