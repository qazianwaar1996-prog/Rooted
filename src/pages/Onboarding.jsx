import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { isAuthenticated, isOnboarded, setOnboarded, setOnboardingChallenge } from '../services/api';

const CHALLENGES = [
  { id: 'sleep', label: 'Sleep & Routines', icon: '😴', desc: 'Bedtime battles, night wakings, nap schedules' },
  { id: 'behavior', label: 'Behavior & Discipline', icon: '🧠', desc: 'Tantrums, defiance, setting boundaries' },
  { id: 'nutrition', label: 'Nutrition & Picky Eating', icon: '🥦', desc: 'Mealtime struggles, balanced diets' },
  { id: 'development', label: 'Development & Milestones', icon: '📈', desc: 'Is my child on track? Speech, motor skills' },
  { id: 'screentime', label: 'Screen Time & Digital Life', icon: '📱', desc: 'Managing devices, online safety' },
  { id: 'anxiety', label: 'Anxiety & Emotions', icon: '💭', desc: 'Big feelings, emotional regulation' },
  { id: 'social', label: 'Social Skills & Friendships', icon: '🤝', desc: 'Sharing, making friends, social confidence' },
  { id: 'education', label: 'Education & Learning', icon: '📚', desc: 'School readiness, learning at home' },
  { id: 'balance', label: 'Work-Life Balance', icon: '⚖️', desc: 'Juggling parenting with everything else' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [childDOB, setChildDOB] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    if (isOnboarded()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    setLoading(false);
  }, []);

  const toggleChallenge = (id) => {
    setSelectedChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleAddChild = () => {
    setError('');
    if (!childName.trim() || !childDOB) {
      setError('Please enter your child\'s name and date of birth.');
      return;
    }
    // Store locally for demo; real impl posts to API
    const children = JSON.parse(localStorage.getItem('rooted_children') || '[]');
    children.push({ id: Date.now(), name: childName.trim(), dob: childDOB });
    localStorage.setItem('rooted_children', JSON.stringify(children));
    setStep(3);
  };

  const handleFinish = () => {
    if (selectedChallenges.length === 0) {
      setError('Please select at least one challenge.');
      return;
    }
    setOnboardingChallenge(JSON.stringify(selectedChallenges));
    setOnboarded();
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="onboarding-loader">
        <div className="onboarding-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <SEOHead title="Set Up Your Family — Rooted" noIndex />

      {/* Progress bar */}
      <div className="onboarding-progress">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`onboarding-step-dot ${s <= step ? 'filled' : ''}`}>
            {s < step ? '✓' : s}
          </div>
        ))}
      </div>

      <div className="onboarding-card">
        {/* ── STEP 1: Welcome ──────────────────────────────── */}
        {step === 1 && (
          <div className="onboarding-step-content">
            <div className="onboarding-emoji">🌳</div>
            <h1>Welcome to Rooted!</h1>
            <p className="onboarding-lead">
              We&apos;re so glad you&apos;re here. Let&apos;s set up your family profile
              so we can personalise your experience with articles, experts,
              and tools tailored to your child&apos;s age.
            </p>
            <div className="onboarding-features">
              <div className="onboard-feat"><span>📝</span> Expert articles for every stage</div>
              <div className="onboard-feat"><span>👩‍⚕️</span> Book 1-on-1 expert sessions</div>
              <div className="onboard-feat"><span>📊</span> Milestone tracking & tools</div>
            </div>
            <button className="btn-forest onboarding-btn" onClick={() => setStep(2)}>
              Tell us about your family →
            </button>
          </div>
        )}

        {/* ── STEP 2: Add first child ──────────────────────── */}
        {step === 2 && (
          <div className="onboarding-step-content">
            <div className="onboarding-emoji">👶</div>
            <h1>Add your first child</h1>
            <p className="onboarding-lead">
              We&apos;ll use their age to recommend articles, milestone trackers,
              and experts that match their stage.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="onboarding-form">
              <label htmlFor="onb-name">Child&apos;s name</label>
              <input
                id="onb-name"
                type="text"
                placeholder="e.g. Oliver"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />

              <label htmlFor="onb-dob">Date of birth</label>
              <input
                id="onb-dob"
                type="date"
                value={childDOB}
                onChange={(e) => setChildDOB(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />

              <div className="onboarding-btns">
                <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-forest" onClick={handleAddChild}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Parenting challenge ──────────────────── */}
        {step === 3 && (
          <div className="onboarding-step-content">
            <div className="onboarding-emoji">🎯</div>
            <h1>What&apos;s your biggest parenting challenge?</h1>
            <p className="onboarding-lead">
              Choose up to 3. We&apos;ll prioritise content and experts
              that address what matters most to you right now.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="challenge-grid">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  className={`challenge-chip ${selectedChallenges.includes(c.id) ? 'selected' : ''}`}
                  onClick={() => toggleChallenge(c.id)}
                >
                  <span className="challenge-icon">{c.icon}</span>
                  <span className="challenge-label">{c.label}</span>
                  <span className="challenge-desc">{c.desc}</span>
                </button>
              ))}
            </div>

            <div className="onboarding-btns">
              <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-forest" onClick={handleFinish}>
                Go to my dashboard →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Done (handled by redirect, but shown as flash) ── */}
        {step === 4 && (
          <div className="onboarding-step-content onboarding-done">
            <div className="onboarding-emoji">🎉</div>
            <h1>You&apos;re all set!</h1>
            <p className="onboarding-lead">Taking you to your personalised dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}
