"""Email router — triggers transactional emails via Resend."""

from datetime import datetime
from fastapi import APIRouter, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from database import get_db
from models import User, CommunityPost
from services.email_service import (
    send_welcome_email,
    send_day3_email,
    send_day7_email,
    send_weekly_digest,
)

router = APIRouter(prefix="/emails", tags=["emails"])


# ── Trigger helpers (called from other routers or scheduled jobs) ──

async def trigger_welcome_email(user: User):
    """Send welcome email to a newly registered user."""
    article_title = "Screen Time by Age: The 2026 Complete Guide"
    article_slug = "screen-time-by-age-2026-complete-guide"
    send_welcome_email(user.email, user.name, article_title, article_slug)


async def trigger_day3_email(user: User):
    """Send Day-3 'Meet the Experts' email."""
    expert_names = "Dr. Sarah Chen, Aisha Patel, and Emily Watson"
    send_day3_email(user.email, user.name, expert_names)


async def trigger_day7_email(user: User, db: AsyncSession):
    """Send Day-7 community engagement email."""
    try:
        trending = ["Screen Time", "Sleep Training", "Positive Discipline"]
        trending_str = ", ".join(f"#{t}" for t in trending)

        result = await db.execute(
            select(CommunityPost)
            .order_by(CommunityPost.like_count.desc())
            .limit(1)
        )
        top_post = result.scalars().first()

        snippet = "Join the conversation with thousands of other parents!"
        post_url = "https://rooted-parenting.com/community"
        if top_post:
            snippet = top_post.body[:120] + "…"
            post_url = f"https://rooted-parenting.com/community/{top_post.id}"

        send_day7_email(user.email, user.name, trending_str, snippet, post_url)
    except Exception:
        # Gracefully fail — the project may not have community tables yet
        send_day7_email(
            user.email, user.name,
            "#ScreenTime, #SleepTraining, #PositiveDiscipline",
            "Join the conversation with thousands of other parents!",
            "https://rooted-parenting.com/community",
        )


async def trigger_weekly_digest(user: User, db: AsyncSession):
    """Send weekly digest with top articles, community highlight, and expert tip."""
    articles_html = "".join([
        '<div style="background:#fff;border:1px solid #F0E8D8;border-radius:6px;padding:12px">'
        '<p style="color:#2A4A1E;font-size:13px;font-weight:600;margin:0 0 4px">'
        'Screen Time by Age: The 2026 Complete Guide'
        '</p>'
        '<p style="color:#8A8070;font-size:11px;margin:0">Evidence-based screen time recommendations for every stage.</p>'
        '</div>',
        '<div style="background:#fff;border:1px solid #F0E8D8;border-radius:6px;padding:12px">'
        '<p style="color:#2A4A1E;font-size:13px;font-weight:600;margin:0 0 4px">'
        'Discipline Without Yelling: 7 Techniques That Work'
        '</p>'
        '<p style="color:#8A8070;font-size:11px;margin:0">Calm, effective discipline strategies backed by behavioral psychology.</p>'
        '</div>',
        '<div style="background:#fff;border:1px solid #F0E8D8;border-radius:6px;padding:12px">'
        '<p style="color:#2A4A1E;font-size:13px;font-weight:600;margin:0 0 4px">'
        'How to Raise Kids Who Are Smarter Than AI'
        '</p>'
        '<p style="color:#8A8070;font-size:11px;margin:0">The uniquely human skills AI cannot replicate.</p>'
        '</div>',
    ])

    community_highlight = "My 4-year-old asked me 'Mummy, why is your tummy soft?' and I said 'Because it stretched to hold you when you were growing inside me.' She hugged my tummy and said 'I love your soft tummy.' These moments make it all worth it. 💛"
    expert_tip = "From Dr. Sarah Chen: 'When your toddler is having a meltdown, name the emotion before trying to solve the problem. Say \"I see you're feeling frustrated\" — this simple act of validation can de-escalate the situation in seconds.'"

    send_weekly_digest(user.email, user.name, articles_html, community_highlight, expert_tip)


# ── Admin: manual trigger endpoints ──────────────────────────

class TriggerEmailRequest(BaseModel):
    user_id: int


@router.post("/trigger-welcome")
async def manual_trigger_welcome(req: TriggerEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        return {"error": "User not found"}
    await trigger_welcome_email(user)
    return {"status": "sent", "to": user.email}


@router.post("/trigger-day3")
async def manual_trigger_day3(req: TriggerEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        return {"error": "User not found"}
    await trigger_day3_email(user)
    return {"status": "sent", "to": user.email}


@router.post("/trigger-day7")
async def manual_trigger_day7(req: TriggerEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        return {"error": "User not found"}
    await trigger_day7_email(user, db)
    return {"status": "sent", "to": user.email}


@router.post("/trigger-digest")
async def manual_trigger_digest(req: TriggerEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        return {"error": "User not found"}
    await trigger_weekly_digest(user, db)
    return {"status": "sent", "to": user.email}
