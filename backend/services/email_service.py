"""Resend email service — transactional and marketing emails for Rooted."""

import os
from typing import Optional

# Resend Python client
try:
    import resend
    HAS_RESEND = True
except ImportError:
    HAS_RESEND = False

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = "Rooted <hello@rooted-parenting.com>"


def _send_email(to: str, subject: str, html: str) -> bool:
    """Send an email via Resend. Returns True if successful."""
    if not HAS_RESEND:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        print(f"[EMAIL STUB] {html[:200]}...")
        return True  # Stub success for development

    if not RESEND_API_KEY:
        print(f"[EMAIL WARNING] RESEND_API_KEY not set. Skipping email to {to}")
        return False

    try:
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to}: {e}")
        return False


# ═══════════════════════════════════════════════════════════════
#  EMAIL TEMPLATE HELPERS
# ═══════════════════════════════════════════════════════════════

def _wrap_email(title: str, body_html: str) -> str:
    """Wrap email body in a consistent Rooted-branded layout."""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(42,74,30,0.06)">
      <tr>
        <td style="background:#2A4A1E;padding:28px 32px;text-align:center">
          <h1 style="color:#fff;font-family:Georgia,serif;font-size:22px;margin:0">🌳 Rooted</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0">Growing together. Raising kind humans.</p>
        </td>
      </tr>
      <tr><td style="padding:32px">
        <h2 style="color:#2A4A1E;font-family:Georgia,serif;font-size:18px;margin:0 0 16px">{title}</h2>
        {body_html}
      </td></tr>
      <tr>
        <td style="background:#F5F0E8;padding:20px 32px;text-align:center;font-size:11px;color:#8A8070">
          You received this email because you signed up at <a href="https://rooted-parenting.com" style="color:#B8792A">Rooted</a>.
          <br /><a href="{{unsubscribe}}" style="color:#8A8070">Unsubscribe</a> &middot; <a href="https://rooted-parenting.com/dashboard" style="color:#8A8070">Dashboard</a>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


def send_welcome_email(to: str, name: str, article_title: str, article_slug: str) -> bool:
    """Welcome email — sent immediately after registration."""
    article_url = f"https://rooted-parenting.com/articles/{article_slug}"

    body = f"""
    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 16px">
      <strong>Hi {name},</strong><br /><br />
      Welcome to Rooted! We're thrilled to have you on this parenting journey with us.
    </p>

    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 16px">
      <strong>Here's what to do first:</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0E8D8">
          <span style="font-size:14px">👶</span>
          <span style="font-size:14px;color:#2A4A1E;font-weight:600;margin-left:8px">Add your child's profile</span>
          <span style="float:right"><a href="https://rooted-parenting.com/dashboard" style="background:#2A4A1E;color:#fff;text-decoration:none;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600">Go →</a></span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0E8D8">
          <span style="font-size:14px">🧪</span>
          <span style="font-size:14px;color:#2A4A1E;font-weight:600;margin-left:8px">Try the Milestone Tracker</span>
          <span style="float:right"><a href="https://rooted-parenting.com/resources/milestone-tracker" style="background:#2A4A1E;color:#fff;text-decoration:none;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600">Try it →</a></span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0">
          <span style="font-size:14px">💬</span>
          <span style="font-size:14px;color:#2A4A1E;font-weight:600;margin-left:8px">Join the community</span>
          <span style="float:right"><a href="https://rooted-parenting.com/community" style="background:#2A4A1E;color:#fff;text-decoration:none;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600">Join →</a></span>
        </td>
      </tr>
    </table>

    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 4px">📝 Featured Article</p>
      <p style="color:#2A4A1E;font-size:14px;font-weight:600;margin:0 0 6px">{article_title}</p>
      <a href="{article_url}" style="color:#B8792A;font-size:13px;font-weight:600;text-decoration:none">Read article →</a>
    </div>

    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0">
      We're building a community of parents who support each other with evidence-based guidance and real-world wisdom. Glad you're part of it.
    </p>
    """

    return _send_email(to, "Welcome to Rooted 🌳", _wrap_email("Welcome to Rooted", body))


def send_day3_email(to: str, name: str, expert_names: str) -> bool:
    """Day-3 email — introduces expert marketplace."""
    body = f"""
    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 16px">
      <strong>Hi {name},</strong><br /><br />
      You've been with Rooted for a few days now. Have you met our experts yet?
    </p>

    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 16px">
      We've hand-picked certified professionals who specialise in the challenges you're facing right now. {expert_names} — are available for 1-on-1 video sessions.
    </p>

    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="color:#2A4A1E;font-size:14px;font-weight:600;margin:0 0 8px">What you can get help with:</p>
      <p style="color:#4A4640;font-size:13px;line-height:1.6;margin:0">
        🌙 Sleep training & routines<br />
        🧠 Behaviour and discipline strategies<br />
        📱 Screen time and digital wellness<br />
        😟 Childhood anxiety and emotional regulation<br />
        🍎 Picky eating and family nutrition
      </p>
    </div>

    <a href="https://rooted-parenting.com/experts" style="display:inline-block;background:#2A4A1E;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Meet Our Experts →</a>
    """

    return _send_email(to, "Have you met our experts? 🧑‍⚕️", _wrap_email("Have you met our experts?", body))


def send_day7_email(to: str, name: str, trending_topics: str, post_snippet: str, post_url: str) -> bool:
    """Day-7 email — highlights community activity."""
    body = f"""
    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 16px">
      <strong>Hi {name},</strong><br /><br />
      One week in! Here's what parents in our community are talking about right now.
    </p>

    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 6px">🔥 Trending Topics</p>
      <p style="color:#4A4640;font-size:13px;line-height:1.6;margin:0">{trending_topics}</p>
    </div>

    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 6px">💬 From the Community</p>
      <p style="color:#2A4A1E;font-size:14px;line-height:1.5;margin:0 0 8px;font-style:italic">\"{post_snippet}\"</p>
      <a href="{post_url}" style="color:#B8792A;font-size:13px;font-weight:600;text-decoration:none">Join the conversation →</a>
    </div>

    <a href="https://rooted-parenting.com/community" style="display:inline-block;background:#2A4A1E;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">See What Parents Are Saying →</a>
    """

    return _send_email(to, "Parents like you are asking... 💬", _wrap_email("Parents like you are asking...", body))


def send_weekly_digest(to: str, name: str, articles_html: str, community_highlight: str, expert_tip: str) -> bool:
    """Weekly digest — every Sunday."""
    body = f"""
    <p style="color:#4A4640;font-size:14px;line-height:1.7;margin:0 0 20px">
      <strong>Hi {name},</strong><br /><br />
      Here's your weekly digest of the best parenting content on Rooted — curated just for you.
    </p>

    <div style="margin-bottom:20px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 10px">📝 Top Articles This Week</p>
      <div style="display:flex;flex-direction:column;gap:10px">{articles_html}</div>
    </div>

    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 6px">💬 Community Highlight</p>
      <p style="color:#4A4640;font-size:13px;line-height:1.5;margin:0">\"{community_highlight}\"</p>
    </div>

    <div style="background:#F5F0E8;border-left:3px solid #B8792A;border-radius:0 8px 8px 0;padding:16px;margin-bottom:20px">
      <p style="color:#B8792A;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 6px">🧑‍⚕️ Expert Tip of the Week</p>
      <p style="color:#2A4A1E;font-size:13px;line-height:1.5;margin:0">{expert_tip}</p>
    </div>

    <a href="https://rooted-parenting.com/dashboard" style="display:inline-block;background:#2A4A1E;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Go to My Dashboard →</a>
    """

    return _send_email(to, "Your Weekly Rooted Digest 🌱", _wrap_email("Your Weekly Rooted Digest", body))
