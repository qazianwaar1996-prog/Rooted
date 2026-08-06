import { useState } from 'react';
import '../styles/app.css';

export default function ScreenTimeCalculator() {
  const [age, setAge] = useState(6);

  const recommendations = {
    0: { total: 0, educational: 0, entertainment: 0 },
    1: { total: 0.5, educational: 0.25, entertainment: 0.25 },
    2: { total: 0.75, educational: 0.5, entertainment: 0.25 },
    3: { total: 1, educational: 0.5, entertainment: 0.5 },
    4: { total: 1, educational: 0.5, entertainment: 0.5 },
    5: { total: 1.25, educational: 0.75, entertainment: 0.5 },
    6: { total: 1.5, educational: 1, entertainment: 0.5 },
    7: { total: 1.5, educational: 1, entertainment: 0.5 },
    8: { total: 1.75, educational: 1.25, entertainment: 0.5 },
    9: { total: 1.75, educational: 1.25, entertainment: 0.5 },
    10: { total: 2, educational: 1.25, entertainment: 0.75 },
    11: { total: 2, educational: 1.25, entertainment: 0.75 },
    12: { total: 2.5, educational: 1.5, entertainment: 1 },
    13: { total: 2.5, educational: 1.5, entertainment: 1 },
    14: { total: 2.5, educational: 1.5, entertainment: 1 },
    15: { total: 2.5, educational: 1.5, entertainment: 1 },
    16: { total: 3, educational: 1.5, entertainment: 1.5 },
    17: { total: 3, educational: 1.5, entertainment: 1.5 },
  };

  const rec = recommendations[age] || recommendations[6];

  const tips = {
    '0-2 years': [
      'Prioritize interactive play over screens.',
      'Video chat with family is more valuable than passive viewing.',
      'Avoid screens entirely for children under 18 months when possible.',
    ],
    '3-5 years': [
      'Choose high-quality educational content co-viewed with parents.',
      'Keep screen time to 1 hour or less per day.',
      'Avoid screens during meals and 1 hour before bedtime.',
    ],
    '6-9 years': [
      'Balance screen time with physical activity and sleep.',
      'Favor educational and creative content over pure entertainment.',
      'Establish family screen time rules together with your child.',
    ],
    '10-12 years': [
      'Encourage screen use for creation, not just consumption.',
      'Monitor social media readiness; delay when possible.',
      'Keep devices out of bedrooms overnight.',
    ],
    '13-17 years': [
      'Discuss digital citizenship and online safety openly.',
      'Encourage breaks and offline hobbies regularly.',
      'Model healthy screen habits yourself.',
    ],
  };

  const ageGroup = age <= 2 ? '0-2 years' : age <= 5 ? '3-5 years' : age <= 9 ? '6-9 years' : age <= 12 ? '10-12 years' : '13-17 years';
  const ageTips = tips[ageGroup] || tips['6-9 years'];

  return (
    <div className="calculator-page">
      <header className="calculator-header">
        <h1>Screen Time Calculator</h1>
        <p>Age-appropriate recommendations backed by pediatric guidelines.</p>
      </header>

      <section className="calculator-card">
        <div className="calculator-row">
          <label htmlFor="age-slider" className="calculator-label">
            Child's Age: <strong>{age} years</strong>
          </label>
          <input
            id="age-slider"
            type="range"
            min={0}
            max={17}
            value={age}
            onChange={e => setAge(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="results-section" aria-label="Screen time results">
        <div className="results-summary">
          <h2>Recommendation for Age {age}</h2>
          <div className="results-total">
            <span className="results-total-number">{rec.total}</span>
            <span className="results-total-label">hours / day</span>
          </div>
        </div>

        <div className="results-bars">
          <div className="result-bar-wrapper">
            <div className="result-bar-label">Educational</div>
            <div className="result-bar-track">
              <div
                className="result-bar-fill result-bar-educational"
                style={{ width: `${(rec.educational / 3) * 100}%` }}
              />
            </div>
            <span className="result-bar-value">{rec.educational}h</span>
          </div>
          <div className="result-bar-wrapper">
            <div className="result-bar-label">Entertainment</div>
            <div className="result-bar-track">
              <div
                className="result-bar-fill result-bar-entertainment"
                style={{ width: `${(rec.entertainment / 3) * 100}%` }}
              />
            </div>
            <span className="result-bar-value">{rec.entertainment}h</span>
          </div>
        </div>
      </section>

      <section className="tips-section" aria-label="Expert tips">
        <h2>Expert Tips for This Age</h2>
        <ul className="tips-list">
          {ageTips.map((tip, i) => (
            <li key={i} className="tip-item">{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
