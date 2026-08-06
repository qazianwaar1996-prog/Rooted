import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import SEOHead from '../components/SEOHead';
import { isAuthenticated } from '../services/api';
import postsData from '../data/communityPosts.json';
import expertsData from '../data/experts.json';

const STORAGE_KEY = 'rooted_community_posts';

function loadPosts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) return stored;
  } catch { /* ignore */ }
  const seeded = postsData.map((p) => ({ ...p }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

const GROUPS = [
  { id: 'all', name: 'All Groups', icon: '\uD83C\uDF0D', memberCount: 35594, desc: 'See posts from every parenting stage' },
  { id: 'expecting', name: 'Expecting Parents', icon: '\uD83E\uDD30', memberCount: 2847, desc: 'For parents preparing for their little one' },
  { id: 'newborn', name: 'Newborn', icon: '\uD83C\uDF7C', memberCount: 5421, desc: 'Sleep, feeding, and those precious first months' },
  { id: 'toddler', name: 'Toddler', icon: '\uD83E\uDDF8', memberCount: 7832, desc: 'Tantrums, milestones, and first words' },
  { id: 'preschool', name: 'Preschool', icon: '\uD83C\uDFA8', memberCount: 6104, desc: 'Social skills, creativity, and preparing for school' },
  { id: 'school_age', name: 'School Age', icon: '\uD83D\uDCDA', memberCount: 4376, desc: 'Friendships, homework, and growing independence' },
  { id: 'tween_teen', name: 'Tween & Teen', icon: '\uD83C\uDF1F', memberCount: 3891, desc: 'Navigating adolescence together' },
  { id: 'ai_age', name: 'AI Age Parenting', icon: '\uD83E\uDD16', memberCount: 5123, desc: 'Raising kids in the era of artificial intelligence' },
];

const TRENDING_TOPICS = [
  { tag: 'Screen Time', count: 2341 },
  { tag: 'Sleep Training', count: 1892 },
  { tag: 'Tantrums', count: 1654 },
  { tag: 'AI in Schools', count: 1432 },
  { tag: 'Picky Eating', count: 1287 },
  { tag: 'Sibling Rivalry', count: 1103 },
];

const ACTIVE_MEMBERS = [
  { name: 'Jessica M.', initial: 'J', posts: 47 },
  { name: 'David K.', initial: 'D', posts: 39 },
  { name: 'Priya C.', initial: 'P', posts: 35 },
  { name: 'Robert D.', initial: 'R', posts: 31 },
  { name: 'Aisha K.', initial: 'A', posts: 28 },
];

export default function Community() {
  const navigate = useNavigate();

  const [activeGroup, setActiveGroup] = useState('all');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCompose, setShowCompose] = useState(false);
  const [composeBody, setComposeBody] = useState('');
  const [composeGroup, setComposeGroup] = useState('toddler');
  const [composeAnon, setComposeAnon] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [composeSuccess, setComposeSuccess] = useState('');

  const expertOfWeek = expertsData[Math.floor(Math.random() * expertsData.length)];

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const allPosts = loadPosts();
      setPosts(allPosts);
      setFilteredPosts(activeGroup === 'all' ? allPosts : allPosts.filter((p) => p.groupId === activeGroup));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (activeGroup === 'all') setFilteredPosts(posts);
    else setFilteredPosts(posts.filter((p) => p.groupId === activeGroup));
  }, [activeGroup, posts]);

  const handleLike = useCallback((postId) => {
    setPosts((prev) => { const updated = prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)); savePosts(updated); return updated; });
  }, []);

  const handleComposeSubmit = () => {
    setComposeError('');
    if (!composeBody.trim()) { setComposeError('Please write something to share.'); return; }
    if (composeBody.length > 500) { setComposeError('Post must be 500 characters or fewer.'); return; }
    if (!isAuthenticated()) { setComposeError('Please sign in to post.'); return; }
    const newPost = { id: Date.now(), groupId: composeGroup, authorName: 'You', authorInitial: 'Y', stageLabel: GROUPS.find((g) => g.id === composeGroup)?.name || 'Parent', anonymous: composeAnon, body: composeBody.trim(), imageUrl: null, likes: 0, commentCount: 0, createdAt: new Date().toISOString() };
    const updated = [newPost, ...posts];
    setPosts(updated);
    savePosts(updated);
    setComposeBody(''); setComposeGroup('toddler'); setComposeAnon(false); setShowCompose(false);
    setComposeSuccess('Your post has been shared!');
    setTimeout(() => setComposeSuccess(''), 3000);
  };

  return (
    <div className="community-layout">
      <SEOHead
        title="Parenting Community — Connect with 35,000+ Parents"
        description="Join the Rooted parenting community. Connect with parents across expecting, newborn, toddler, preschool, school age, and teen stages. Share stories, ask questions, and get support from parents who understand."
        noIndex  // User-generated content pages benefit from noindex
      />

      <aside className="comm-sidebar comm-sidebar-left">
        <div className="comm-sidebar-section">
          <h3>Groups</h3>
          <div className="comm-groups-list">
            {GROUPS.map((group) => (
              <button key={group.id} className={`comm-group-btn ${activeGroup === group.id ? 'active' : ''}`} onClick={() => setActiveGroup(group.id)}>
                <span className="comm-group-icon">{group.icon}</span>
                <div className="comm-group-info">
                  <span className="comm-group-name">{group.name}</span>
                  <span className="comm-group-count">{group.memberCount.toLocaleString()} members</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="comm-feed">
        {composeSuccess && <div className="dash-toast success">{composeSuccess}</div>}
        <div className="comm-feed-header">
          <h2>{activeGroup === 'all' ? 'All Groups' : GROUPS.find((g) => g.id === activeGroup)?.name}</h2>
          <button className="btn-forest btn-small" onClick={() => { if (!isAuthenticated()) { navigate('/login'); return; } setShowCompose(true); setComposeError(''); }}>+ New Post</button>
        </div>
        {loading ? (<div className="comm-loading"><div className="dash-spinner" /><p>Loading posts\u2026</p></div>) : filteredPosts.length === 0 ? (
          <div className="empty-state-card"><div className="empty-icon">💬</div><h3>No posts yet</h3><p>Be the first to start a conversation in this group!</p><button className="btn-forest btn-small" onClick={() => { if (!isAuthenticated()) { navigate('/login'); return; } setShowCompose(true); }}>Create a Post</button></div>
        ) : (
          <div className="comm-posts-list">{filteredPosts.map((post) => (<PostCard key={post.id} post={post} onLike={handleLike} />))}</div>
        )}
      </main>

      <aside className="comm-sidebar comm-sidebar-right">
        <div className="comm-sidebar-card"><h3>🔥 Trending Topics</h3><div className="comm-trending-list">{TRENDING_TOPICS.map((t) => (<div key={t.tag} className="comm-trending-item"><span className="comm-trending-tag">#{t.tag.replace(/\s/g, '')}</span><span className="comm-trending-count">{t.count.toLocaleString()} posts</span></div>))}</div></div>
        <div className="comm-sidebar-card"><h3>⭐ Active This Week</h3><div className="comm-members-list">{ACTIVE_MEMBERS.map((m) => (<div key={m.name} className="comm-member-row"><div className="post-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{m.initial}</div><div className="comm-member-info"><span className="comm-member-name">{m.name}</span><span className="comm-member-posts">{m.posts} posts this week</span></div></div>))}</div></div>
        <div className="comm-sidebar-card comm-expert-card"><h3>🧑‍⚕️ Expert of the Week</h3><Link to={`/experts/${expertOfWeek.id}`} className="comm-expert-inner"><div className="post-avatar" style={{ width: 48, height: 48, fontSize: 18, background: 'var(--forest)', color: '#fff' }}>{expertOfWeek.avatar || expertOfWeek.name[0]}</div><div><div className="comm-expert-name">{expertOfWeek.name}</div><div className="comm-expert-spec">{expertOfWeek.speciality}</div><div className="comm-expert-rating">★ {expertOfWeek.rating} ({expertOfWeek.reviews} reviews)</div></div></Link><p className="comm-expert-bio">{expertOfWeek.bio?.slice(0, 120)}…</p><Link to={`/experts/${expertOfWeek.id}`} className="btn-outline btn-small" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>Book a Session</Link></div>
      </aside>

      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-card compose-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header"><h2>Create a Post</h2><button className="modal-close-btn" onClick={() => setShowCompose(false)}>×</button></div>
            {composeError && <div className="auth-error">{composeError}</div>}
            <div className="modal-form">
              <label htmlFor="compose-group">Post in</label>
              <select id="compose-group" value={composeGroup} onChange={(e) => setComposeGroup(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--sand)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', background: 'var(--warm-white)', marginBottom: 16 }}>
                {GROUPS.filter((g) => g.id !== 'all').map((g) => (<option key={g.id} value={g.id}>{g.icon} {g.name}</option>))}
              </select>
              <label htmlFor="compose-body">What's on your mind?</label>
              <textarea id="compose-body" rows={5} placeholder="Share your story, ask a question, or offer support\u2026" value={composeBody} onChange={(e) => setComposeBody(e.target.value)} maxLength={500} style={{ marginBottom: 8 }} />
              <div className="compose-char-count" style={{ color: composeBody.length > 450 ? 'var(--amber)' : 'var(--stone)' }}>{composeBody.length} / 500</div>
              <label className="compose-anon-label" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--mid)' }}><input type="checkbox" checked={composeAnon} onChange={(e) => setComposeAnon(e.target.checked)} style={{ accentColor: 'var(--forest)', width: 18, height: 18 }} />Post anonymously</label>
              <button className="btn-forest" onClick={handleComposeSubmit}>Share Post</button>
            </div>
          </div>
        </div>
      )}

      <button className="comm-fab" onClick={() => { if (!isAuthenticated()) { navigate('/login'); return; } setShowCompose(true); setComposeError(''); }} title="New post">✏️</button>
    </div>
  );
}
