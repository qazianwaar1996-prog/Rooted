import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/app.css';

const questions = [
  {
    q: 'How do you respond when your child refuses to follow a rule?',
    options: [
      'I explain the reason and ask for cooperation.',
      'I stay calm, validate their feelings, then guide.',
      'I enforce the rule clearly and consistently.',
      'I observe and adapt based on the situation.',
    ],
  },
  {
    q: 'What is your approach to discipline?',
    options: [
      'Natural consequences and reasoning.',
      'Connection before correction.',
      'Clear expectations with consistent follow-through.',
      'Flexible responses guided by intuition.',
    ],
  },
  {
    q: 'How structured is your child\'s daily routine?',
    options: [
      'Flexible but predictable.',
      'Loosely guided by the child\'s needs.',
      'Highly structured with clear schedules.',
      'Changes based on our energy and plans.',
    ],
  },
  {
    q: 'When your child is upset, what do you do first?',
    options: [
      'Listen and help them label emotions.',
      'Offer comfort and presence.',
      'Help them calm down, then discuss.',
      'Trust my instincts about what they need.',
    ],
  },
  {
    q: 'How important is independence for your child?',
    options: [
      'Very important within safe boundaries.',
      'Essential at their own pace.',
      'Important with guided practice.',
      'I follow their lead naturally.',
    ],
  },
  {
    q: 'How do you handle mistakes?',
    options: [
      'Discuss what went wrong and how to fix it.',
      'Offer empathy and support through it.',
      'Review rules and encourage better choices.',
      'Reflect together on what feels right.',
    ],
  },
  {
    q: 'How do you view rules and boundaries?',
    options: [
      'Necessary frameworks with explanations.',
      'Guidelines that grow with the child.',
      'Clear lines that create security.',
      'Fluid boundaries guided by relationship.',
    ],
  },
  {
    q: 'What is your goal as a parent?',
    options: [
      'Raise a responsible, capable, kind adult.',
      'Build emotional resilience and self-awareness.',
      'Provide structure that builds confidence.',
      'Trust the process and stay attuned.',
    ],
  },
];

const styles = {
  Authoritative: {
    name: 'Authoritative',
    desc: 'You balance warmth and structure. You explain rules, listen to your child, and set clear expectations with consistency. Your approach builds independence within safe boundaries.',
    articles: [
      { title: 'Positive Discipline That Works', slug: 'positive-discipline' },
      { title: 'Screen Time by Age: The 2026 Complete Guide', slug: 'screen-time-by-age-2026-complete-guide' },
    ],
  },
  Gentle: {
    name: 'Gentle',
    desc: 'You prioritize connection and emotional safety. You validate feelings before guiding behavior, creating a secure base from which your child can grow.',
    articles: [
      { title: 'Helping Kids Manage Big Emotions', slug: 'screen-time-by-age-2026-complete-guide' },
      { title: 'From Overwhelmed to Confident', slug: 'screen-time-by-age-2026-complete-guide' },
    ],
  },
  Structured: {
    name: 'Structured',
    desc: 'You value predictability and clear expectations. Your child knows what to expect and finds security in consistent routines and well-defined boundaries.',
    articles: [
      { title: 'Age-by-Age Guide to Child Development: 0–12 Years', slug: 'age-by-age-guide-to-child-development-0-12' },
      { title: 'The Honest Screen Time Rules for 2026', slug: 'honest-screen-time-rules-for-2026' },
    ],
  },
  Intuitive: {
    name: 'Intuitive',
    desc: 'You respond to each moment with awareness and adaptability. Your parenting is guided by deep attunement to your child\'s unique needs and the dynamics at play.',
    articles: [
      { title: 'How to Raise Kids Who Are Smarter Than AI', slug: 'how-to-raise-kids-who-are-smarter-than-ai' },
      { title: 'Raising Emotionally Resilient Kids in 2026', slug: 'raising-emotionally-resilient-kids-in-2026' },
    ],
  },
};

export default function ParentingQuiz() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex, optionIndex) => {
    const next = [...answers];
    next[qIndex] = optionIndex;
    setAnswers(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answers.includes(null)) return;
    setSubmitted(true);
  };

  const calculateResult = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach(idx => {
      const option = idx % 4;
      const key = String.fromCharCode(65 + option);
      counts[key]++;
    });
    const maxKey = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const mapping = { A: 'Authoritative', B: 'Gentle', C: 'Structured', D: 'Intuitive' };
    return styles[mapping[maxKey]];
  };

  const result = submitted ? calculateResult() : null;
  const progress = (answers.filter(a => a !== null).length / questions.length) * 100;

  return (
    <div className="quiz-page">
      <header className="quiz-header">
        <h1>Parenting Style Quiz</h1>
        <p>Discover your parenting approach and get tailored guidance.</p>
      </header>

      {!submitted ? (
        <form className="quiz-form" onSubmit={handleSubmit}>
          {/* Progress bar */}
          <div className="quiz-progress-wrapper">
            <div className="quiz-progress-label">{answers.filter(a => a !== null).length} of {questions.length} answered</div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {questions.map((q, i) => (
            <section key={i} className="quiz-question" aria-label={`Question ${i + 1}`}>
              <h3 className="quiz-question-number">Question {i + 1} of {questions.length}</h3>
              <h2 className="quiz-question-text">{q.q}</h2>
              <div className="quiz-options">
                {q.options.map((opt, o) => (
                  <label key={o} className={`quiz-option ${answers[i] === o ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={o}
                      checked={answers[i] === o}
                      onChange={() => handleSelect(i, o)}
                    />
                    <span className="quiz-option-text">{opt}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}

          <div className="quiz-submit-wrapper">
            <button
              type="submit"
              className="btn-forest"
              disabled={answers.includes(null)}
            >
              See My Style
            </button>
          </div>
        </form>
      ) : (
        <section className="quiz-result" aria-label="Quiz result">
          <h2>Your Parenting Style</h2>
          <div className="result-style-card">
            <h3 className="result-style-name">{result.name}</h3>
            <p className="result-style-desc">{result.desc}</p>
          </div>

          <div className="result-articles">
            <h4>Recommended Articles</h4>
            <div className="result-articles-grid">
              {result.articles.map(art => (
                <Link to={`/articles/${art.slug}`} key={art.slug} className="result-article-card">
                  <h5>{art.title}</h5>
                  <span>Read →</span>
                </Link>
              ))}
            </div>
          </div>

          <button className="btn-outline" onClick={() => { setSubmitted(false); setAnswers(Array(questions.length).fill(null)); }}>
            Take Quiz Again
          </button>
        </section>
      )}
    </div>
  );
}
