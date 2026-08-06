import { Link } from 'react-router-dom';
import '../styles/app.css';

const tools = [
  {
    name: 'Milestone Tracker',
    desc: 'Track your child\'s development milestones by age with personalized checklists.',
    icon: '📋',
    path: '/resources/milestone-tracker',
  },
  {
    name: 'Screen Time Calculator',
    desc: 'Calculate age-appropriate daily screen time recommendations for your family.',
    icon: '⏱️',
    path: '/resources/screen-time',
  },
  {
    name: 'Parenting Style Quiz',
    desc: 'Discover your parenting approach and get tailored guidance for your family.',
    icon: '🎯',
    path: '/resources/quiz',
  },
];

const downloads = [
  { title: 'Bedtime Routine Checklist', age: '2–5 years', icon: '📄' },
  { title: 'Positive Discipline Guide', age: 'All Ages', icon: '📄' },
  { title: 'Emotional Literacy Worksheet', age: '5–12 years', icon: '📄' },
  { title: 'Screen Time Agreement Template', age: '6–17 years', icon: '📄' },
];

export default function Resources() {
  return (
    <div className="resources-page">
      <header className="resources-header">
        <h1>Tools Built for Real Parents</h1>
        <p>Interactive calculators, checklists, and guides you can use today—no account required.</p>
      </header>

      <section className="tools-grid" aria-label="Parenting tools">
        {tools.map(tool => (
          <Link to={tool.path} key={tool.name} className="tool-card">
            <div className="tool-card-icon">{tool.icon}</div>
            <h2 className="tool-card-name">{tool.name}</h2>
            <p className="tool-card-desc">{tool.desc}</p>
            <span className="tool-card-btn">Open Tool →</span>
          </Link>
        ))}
      </section>

      <section className="downloads-section" aria-label="Downloadable resources">
        <h2>Downloadable Resources</h2>
        <div className="downloads-grid">
          {downloads.map(item => (
            <a href="#" key={item.title} className="download-card">
              <div className="download-card-icon">{item.icon}</div>
              <div className="download-card-info">
                <h3 className="download-card-title">{item.title}</h3>
                <span className="download-card-age">{item.age}</span>
              </div>
              <span className="download-card-btn">Download PDF</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
