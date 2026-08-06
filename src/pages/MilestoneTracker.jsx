import { useState } from 'react';
import SEOHead from '../components/SEOHead';
import '../styles/app.css';

const milestoneData = {
  'Newborn (0–3 months)': {
    'Motor Skills': [
      { text: 'Lifts head briefly when on tummy', done: false },
      { text: 'Moves arms and legs with increasing control', done: false },
      { text: 'Opens hands briefly', done: false },
    ],
    'Language': [
      { text: 'Startles at loud sounds', done: false },
      { text: 'Quiets or turns toward familiar voices', done: false },
      { text: 'Makes cooing and gurgling sounds', done: false },
    ],
    'Social': [
      { text: 'Begins to make eye contact', done: false },
      { text: 'Begins to develop a social smile', done: false },
      { text: 'Recognizes familiar faces at close range', done: false },
    ],
    'Cognitive': [
      { text: 'Follows moving objects briefly with eyes', done: false },
      { text: 'Shows preference for human faces', done: false },
    ],
  },
  'Infant (4–12 months)': {
    'Motor Skills': [
      { text: 'Rolls from tummy to back and back to tummy', done: false },
      { text: 'Sits without support', done: false },
      { text: 'Crawls or pulls to stand', done: false },
    ],
    'Language': [
      { text: 'Babbles with consonant sounds (ba, ma)', done: false },
      { text: 'Responds to own name', done: false },
      { text: 'Uses gestures like pointing', done: false },
    ],
    'Social': [
      { text: 'Shows stranger anxiety', done: false },
      { text: 'Plays peek-a-boo', done: false },
      { text: 'Shows preference for familiar people', done: false },
    ],
    'Cognitive': [
      { text: 'Explores objects by putting them in mouth', done: false },
      { text: 'Looks for partially hidden objects', done: false },
    ],
  },
  'Toddler (1–3 years)': {
    'Motor Skills': [
      { text: 'Walks independently and climbs stairs', done: false },
      { text: 'Runs and kicks a ball', done: false },
      { text: 'Uses utensils and scribbles', done: false },
    ],
    'Language': [
      { text: 'Uses 50+ words and 2-word phrases', done: false },
      { text: 'Follows simple 2-step directions', done: false },
      { text: 'Points to body parts when named', done: false },
    ],
    'Social': [
      { text: 'Shows independence and defiance', done: false },
      { text: 'Begins parallel play near others', done: false },
      { text: 'Shows affection to familiar people', done: false },
    ],
    'Cognitive': [
      { text: 'Sorts shapes and colors', done: false },
      { text: 'Engages in pretend play', done: false },
      { text: 'Completes simple puzzles', done: false },
    ],
  },
};

export default function MilestoneTracker() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [results, setResults] = useState(null);
  const [checked, setChecked] = useState({});

  const calculateAge = () => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    if (today.getDate() < birth.getDate()) months--;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return { years, months, remainingMonths };
  };

  const getAgeGroup = (months) => {
    if (months < 4) return 'Newborn (0–3 months)';
    if (months < 13) return 'Infant (4–12 months)';
    if (months < 37) return 'Toddler (1–3 years)';
    return 'Older Child';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const age = calculateAge();
    if (age) {
      const group = getAgeGroup(age.months);
      const groupData = milestoneData[group] || milestoneData['Newborn (0–3 months)'];
      setResults({ name, group, groupData, years: age.years, months: age.months });
    }
  };

  const toggleCheck = (cat, idx) => {
    const key = `${cat}-${idx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const shareResult = () => {
    const text = `${results?.name || 'My child'} is ${results?.years ? results.years + 'y ' : ''}${results?.months}m. Milestone progress tracked on Rooted.`;
    navigator.clipboard?.writeText(text);
    alert('Result copied to clipboard!');
  };

  return (
    <div className="tracker-page">
      <SEOHead
        title="Free Milestone Tracker — Track Your Child's Development by Age"
        description="Track your child's developmental milestones with age-appropriate checklists. Monitor speech, motor skills, social development, and cognitive growth from newborn to toddler. Know when to talk to your pediatrician."
        keywords="toddler milestones, child development tracker, milestone checklist, 18 month milestones, baby milestones"
        canonicalUrl="https://rooted-parenting.com/resources/milestone-tracker"
      />

      <header className="tracker-header">
        <h1>Milestone Tracker</h1>
        <p>Track your child's development with age-appropriate milestone checklists.</p>
      </header>

      <form className="tracker-form" onSubmit={handleSubmit}>
        <div className="tracker-input-row">
          <label htmlFor="childName">Child's Name</label>
          <input id="childName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter first name" required />
        </div>
        <div className="tracker-input-row">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
        </div>
        <button type="submit" className="btn-forest" style={{ marginTop: '8px' }}>Show Milestones</button>
      </form>

      {results && (
        <section className="tracker-results" aria-label="Milestone results">
          <div className="tracker-summary">
            <h2>Results for {results.name}</h2>
            <p className="tracker-age">Age: {results.years > 0 ? results.years + ' year' + (results.years > 1 ? 's' : '') : ''} {results.months > 0 ? results.months + ' month' + (results.months > 1 ? 's' : '') : ''} — <strong>{results.group}</strong></p>
          </div>
          {Object.entries(results.groupData).map(([category, items]) => (
            <div key={category} className="milestone-category">
              <h3>{category}</h3>
              <ul className="milestone-list">
                {items.map((item, i) => {
                  const key = `${category}-${i}`;
                  return (
                    <li key={key} className="milestone-item">
                      <label className="milestone-checkbox-label">
                        <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck(category, i)} />
                        <span className="milestone-check-visual" />
                        <span className="milestone-text"><strong>{item.text}</strong></span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="milestone-doctor-section">
            <h3>When to Talk to Your Doctor</h3>
            <p>Consider discussing milestones with your pediatrician if you notice any of the following:</p>
            <ul>
              <li>Loss of skills previously mastered</li>
              <li>Significant delays in multiple areas</li>
              <li>Concerns that persist despite consistent support at home</li>
              <li>Changes in behavior or development that seem sudden</li>
            </ul>
          </div>
          <button className="btn-forest" onClick={shareResult}>Share Result</button>
        </section>
      )}
    </div>
  );
}
