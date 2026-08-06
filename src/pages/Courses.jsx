import SEOHead from '../components/SEOHead';

export default function Courses() {
  return (
    <section style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <SEOHead
        title="Parenting Courses & Workshops — Learn at Your Own Pace"
        description="Step-by-step parenting courses and workshops covering newborn care, toddler discipline, sleep training, emotional resilience, and raising kids in the digital age. Learn from certified experts."
        keywords="parenting courses, parenting workshops, sleep training course, positive discipline course, newborn care course"
        canonicalUrl="https://rooted-parenting.com/courses"
      />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: '2.5rem', color: 'var(--forest)' }}>Courses & Workshops</h1>
      <p style={{ color: 'var(--mid)', marginTop: '16px' }}>Coming soon — expert-led parenting courses for every stage.</p>
    </section>
  );
}
