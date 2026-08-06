import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * PostCard — renders a single community post in the feed.
 * Props:
 *   post       — { id, authorName, authorInitial, stageLabel, anonymous, body, imageUrl, likes, commentCount, createdAt }
 *   onLike     — callback(postId)
 *   onComment  — optional callback that navigates to detail
 *   compact    — if true, don't show "Read more" toggle
 */

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

export default function PostCard({ post, onLike, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [showShareTip, setShowShareTip] = useState(false);

  const isLong = post.body.length > 500;
  const displayBody = expanded || !isLong || compact ? post.body : post.body.slice(0, 500);

  const handleLike = () => {
    if (!isAuthenticated()) return;
    if (!liked) {
      setLiked(true);
      setLocalLikes((l) => l + 1);
      onLike && onLike(post.id);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareTip(true);
      setTimeout(() => setShowShareTip(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className={`post-avatar ${post.anonymous ? 'anon' : ''}`}>
            {post.authorInitial}
          </div>
          <div className="post-author-info">
            <span className="post-author-name">
              {post.anonymous ? 'Anonymous Parent' : post.authorName}
            </span>
            <div className="post-meta-row">
              <span className="post-stage-badge">{post.stageLabel}</span>
              <span className="post-time">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        <p>{displayBody}</p>
        {isLong && !compact && (
          <button className="post-read-more" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="post-image-wrap">
          <img src={post.imageUrl} alt="Post attachment" className="post-image" />
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title={!isAuthenticated() ? 'Sign in to like' : 'Like this post'}
        >
          <span className="post-action-icon">{liked ? '❤️' : '🤍'}</span>
          <span>{localLikes}</span>
        </button>

        <Link to={`/community/${post.id}`} className="post-action-btn">
          <span className="post-action-icon">💬</span>
          <span>{post.commentCount}</span>
        </Link>

        <div className="post-share-wrap">
          <button className="post-action-btn" onClick={handleShare}>
            <span className="post-action-icon">↗</span>
            <span>Share</span>
          </button>
          {showShareTip && <span className="share-tip">Link copied!</span>}
        </div>
      </div>
    </div>
  );
}
