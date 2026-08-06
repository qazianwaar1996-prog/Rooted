import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import SEOHead from '../components/SEOHead';
import { isAuthenticated } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Demo data helper
   ───────────────────────────────────────────────────────────── */

function loadPost(postId) {
  try {
    const stored = JSON.parse(localStorage.getItem('rooted_community_posts') || '[]');
    return stored.find((p) => p.id === Number(postId)) || null;
  } catch {
    return null;
  }
}

function loadComments(postId) {
  try {
    return JSON.parse(localStorage.getItem(`rooted_comments_${postId}`) || '[]');
  } catch {
    return [];
  }
}

function saveComments(postId, comments) {
  localStorage.setItem(`rooted_comments_${postId}`, JSON.stringify(comments));
}

/* ─────────────────────────────────────────────────────────────
   Time ago helper
   ───────────────────────────────────────────────────────────── */

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────
   Seed comments for demo
   ───────────────────────────────────────────────────────────── */

function seedComments(postId) {
  const key = `rooted_comments_${postId}`;
  if (!localStorage.getItem(key)) {
    saveComments(postId, [
      {
        id: 100 + postId,
        parentId: null,
        authorName: 'Aisha K.',
        authorInitial: 'A',
        anonymous: false,
        body: 'I went through the exact same thing with my son. What helped us was naming the emotion first — "I see you\'re feeling frustrated because you can\'t have the toy." Once he felt heard, the hitting reduced dramatically over a few weeks.',
        likesCount: 24,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        replies: [
          {
            id: 200 + postId,
            parentId: 100 + postId,
            authorName: 'Mike T.',
            authorInitial: 'M',
            anonymous: false,
            body: 'Second this! The naming emotions technique was a game changer for us too. We also introduced a "calm down corner" with soft pillows and books — not as punishment, but as a retreat space.',
            likesCount: 8,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: 201 + postId,
            parentId: 100 + postId,
            authorName: 'Dr. Sarah Chen',
            authorInitial: 'S',
            anonymous: false,
            body: 'Great advice here. From a developmental perspective, at 18 months the frontal lobe (impulse control) is still developing. Consistent modeling of gentle touch combined with emotion labeling is the most evidence-based approach at this age.',
            likesCount: 31,
            createdAt: new Date(Date.now() - 900000).toISOString(),
          },
        ],
      },
      {
        id: 101 + postId,
        parentId: null,
        authorName: null,
        authorInitial: 'A',
        anonymous: true,
        body: 'We used a children\'s book called "Hands Are Not for Hitting" and it really clicked for our 2-year-old. Sometimes they just need a simple, concrete message they can understand.',
        likesCount: 15,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        replies: [],
      },
      {
        id: 102 + postId,
        parentId: null,
        authorName: 'Robert D.',
        authorInitial: 'R',
        anonymous: false,
        body: 'Just want to say — it gets better. My son was a hitter at 18 months and now at 3 he\'s the most gentle kid in his preschool class. Consistency is key, even when it feels like it\'s not working in the moment.',
        likesCount: 42,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        replies: [
          {
            id: 202 + postId,
            parentId: 102 + postId,
            authorName: 'Jessica M.',
            authorInitial: 'J',
            anonymous: false,
            body: 'Thank you — I really needed to hear this today. It\'s so easy to feel like you\'re doing something wrong when progress is slow.',
            likesCount: 19,
            createdAt: new Date(Date.now() - 10800000).toISOString(),
          },
        ],
      },
    ]);
  }
  return loadComments(postId);
}

/* ─────────────────────────────────────────────────────────────
   Post Detail Page
   ───────────────────────────────────────────────────────────── */

export default function CommunityPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comment form
  const [commentBody, setCommentBody] = useState('');
  const [commentAnon, setCommentAnon] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, authorName }
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const found = loadPost(postId);
    if (!found) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setPost(found);
    const cmts = seedComments(Number(postId));
    setComments(cmts);
    setLoading(false);
  }, [postId]);

  const handleLike = (pid) => {
    // Update in main posts storage too so the feed stays in sync
    try {
      const stored = JSON.parse(localStorage.getItem('rooted_community_posts') || '[]');
      const updated = stored.map((p) => (p.id === Number(pid) ? { ...p, likes: p.likes + 1 } : p));
      localStorage.setItem('rooted_community_posts', JSON.stringify(updated));
      setPost((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : prev));
    } catch { /* ignore */ }
  };

  const handleSubmitComment = () => {
    setSubmitError('');
    if (!commentBody.trim()) {
      setSubmitError('Please write a comment.');
      return;
    }
    if (!isAuthenticated()) {
      setSubmitError('Please sign in to comment.');
      return;
    }

    const newComment = {
      id: Date.now(),
      parentId: replyTo ? replyTo.id : null,
      authorName: replyTo?.anonymous ? null : 'You',
      authorInitial: 'Y',
      anonymous: commentAnon,
      body: commentBody.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    let updated;
    if (replyTo) {
      // Add as reply to parent comment
      updated = comments.map((c) => {
        if (c.id === replyTo.id) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      });
    } else {
      // Add as top-level comment
      updated = [...comments, newComment];
    }

    setComments(updated);
    saveComments(Number(postId), updated);

    // Update comment count on post
    setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
    try {
      const stored = JSON.parse(localStorage.getItem('rooted_community_posts') || '[]');
      const updatedPosts = stored.map((p) =>
        p.id === Number(postId) ? { ...p, commentCount: p.commentCount + 1 } : p
      );
      localStorage.setItem('rooted_community_posts', JSON.stringify(updatedPosts));
    } catch { /* ignore */ }

    setCommentBody('');
    setReplyTo(null);
    setCommentAnon(false);
  };

  if (loading) {
    return (
      <div className="comm-loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="dash-spinner" />
        <p style={{ marginLeft: 12, color: 'var(--stone)' }}>Loading post…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="community-post-page">
        <div className="empty-state-card">
          <div className="empty-icon">🔍</div>
          <h3>Post not found</h3>
          <p>This post may have been removed or the link is incorrect.</p>
          <Link to="/community" className="btn-forest btn-small">Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="community-post-page">
      <SEOHead title={`Community Post — ${post?.authorName || 'Anonymous Parent'} | Rooted`} noIndex />

      <div className="comm-post-back">
        <Link to="/community">← Back to Community</Link>
      </div>

      {/* Full Post */}
      <PostCard post={post} onLike={handleLike} compact />

      {/* ── Comments Section ───────────────────────────────── */}
      <section className="comm-comments">
        <h3>Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>

        {/* Comment form */}
        <div className="comm-comment-form">
          {replyTo && (
            <div className="comm-reply-indicator">
              Replying to <strong>{replyTo.authorName || 'Anonymous Parent'}</strong>
              <button onClick={() => { setReplyTo(null); setCommentAnon(false); }}>Cancel</button>
            </div>
          )}
          {submitError && <div className="auth-error">{submitError}</div>}
          <textarea
            rows={3}
            placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            maxLength={500}
          />
          <div className="comm-comment-actions">
            <label className="compose-anon-label" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--mid)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={commentAnon}
                onChange={(e) => setCommentAnon(e.target.checked)}
                style={{ accentColor: 'var(--forest)' }}
              />
              Anonymous
            </label>
            <button className="btn-forest btn-small" onClick={handleSubmitComment}>
              {replyTo ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="comm-no-comments">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="comm-comments-list">
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={(c) => {
                  if (!isAuthenticated()) { navigate('/login'); return; }
                  setReplyTo(c);
                  setCommentAnon(false);
                  setSubmitError('');
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CommentThread — renders a comment + its nested replies
   ───────────────────────────────────────────────────────────── */

function CommentThread({ comment, onReply, depth = 0 }) {
  return (
    <div className={`comm-comment ${depth > 0 ? 'nested' : ''}`}>
      <div className="comm-comment-header">
        <div className="post-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
          {comment.authorInitial}
        </div>
        <div>
          <span className="comm-comment-author">
            {comment.anonymous ? 'Anonymous Parent' : comment.authorName}
          </span>
          <span className="post-time" style={{ marginLeft: 8 }}>{timeAgo(comment.createdAt)}</span>
        </div>
      </div>
      <p className="comm-comment-body">{comment.body}</p>
      <div className="comm-comment-footer">
        <span className="comm-comment-likes">❤️ {comment.likesCount}</span>
        {depth === 0 && (
          <button className="comm-reply-btn" onClick={() => onReply(comment)}>
            Reply
          </button>
        )}
      </div>

      {/* Nested replies (1 level only) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comm-replies">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
