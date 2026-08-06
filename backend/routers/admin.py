"""Admin analytics router — requires is_admin flag on user."""

import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from database import get_db
from models import User, ExpertBooking, ChildProfile, SubscriptionTier
from auth.security import decode_token

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "admin@rooted-parenting.com").split(",")


async def require_admin(token: str = Depends(), db: AsyncSession = Depends(get_db)):
    """Dependency: require is_admin flag on the user."""
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user or not user.is_admin:
        # Also allow hardcoded admin emails for bootstrapping
        if email.strip().lower() not in [e.strip().lower() for e in ADMIN_EMAILS]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return comprehensive analytics dashboard data."""

    # ── Total signups ────────────────────────────────────────
    total_result = await db.execute(select(func.count(User.id)))
    total_users = total_result.scalar() or 0

    # ── New signups this week ────────────────────────────────
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    new_week_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )
    new_this_week = new_week_result.scalar() or 0

    # ── Daily Active Users (logged in within last 24h) ───────
    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    dau_result = await db.execute(
        select(func.count(User.id)).where(User.last_active_at >= day_ago)
    )
    daily_active = dau_result.scalar() or 0

    # ── Total children profiles ──────────────────────────────
    children_result = await db.execute(select(func.count(ChildProfile.id)))
    total_children = children_result.scalar() or 0

    # ── Expert bookings this week ────────────────────────────
    bookings_week_result = await db.execute(
        select(func.count(ExpertBooking.id)).where(ExpertBooking.created_at >= week_ago)
    )
    bookings_this_week = bookings_week_result.scalar() or 0
    confirmed_bookings_result = await db.execute(
        select(func.count(ExpertBooking.id)).where(
            and_(ExpertBooking.created_at >= week_ago, ExpertBooking.status == "confirmed")
        )
    )
    confirmed_bookings = confirmed_bookings_result.scalar() or 0

    # ── Free → Premium conversion ────────────────────────────
    premium_result = await db.execute(
        select(func.count(User.id)).where(User.subscription_tier == SubscriptionTier.premium)
    )
    premium_users = premium_result.scalar() or 0
    conversion_rate = round((premium_users / total_users * 100), 1) if total_users > 0 else 0

    # ── Signups over last 14 days (for chart) ────────────────
    signups_14d = []
    for i in range(14):
        day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=13 - i)
        day_end = day_start + timedelta(days=1)
        r = await db.execute(
            select(func.count(User.id)).where(and_(User.created_at >= day_start, User.created_at < day_end))
        )
        signups_14d.append({
            "date": day_start.strftime("%b %d"),
            "count": r.scalar() or 0,
        })

    return {
        "total_users": total_users,
        "new_this_week": new_this_week,
        "daily_active_users": daily_active,
        "total_children": total_children,
        "bookings_this_week": bookings_this_week,
        "confirmed_bookings": confirmed_bookings,
        "premium_users": premium_users,
        "conversion_rate": conversion_rate,
        "signups_14d": signups_14d,
    }


@router.get("/users")
async def get_recent_users(
    limit: int = 20,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return most recent users for admin view."""
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(limit)
    )
    users = result.scalars().all()
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "subscription_tier": u.subscription_tier.value if hasattr(u.subscription_tier, "value") else u.subscription_tier,
        "created_at": u.created_at.isoformat(),
    } for u in users]
