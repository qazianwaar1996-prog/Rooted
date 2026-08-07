from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from database import get_db
from models import NewsletterSubscriber

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


class NewsletterSubscribe(BaseModel):
    email: EmailStr


@router.post("/subscribe")
async def subscribe(
    sub: NewsletterSubscribe,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(NewsletterSubscriber).where(
            NewsletterSubscriber.email == sub.email
        )
    )
    existing = result.scalars().first()

    if existing:
        if not existing.is_active:
            existing.is_active = True
            await db.commit()
            return {"message": "Resubscribed successfully"}
        return {"message": "Already subscribed"}

    subscriber = NewsletterSubscriber(email=sub.email)
    db.add(subscriber)
    await db.commit()
    return {"message": "Subscribed successfully"}


@router.delete("/unsubscribe")
async def unsubscribe(
    sub: NewsletterSubscribe,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(NewsletterSubscriber).where(
            NewsletterSubscriber.email == sub.email
        )
    )
    subscriber = result.scalars().first()

    if not subscriber:
        raise HTTPException(status_code=404, detail="Email not found")

    subscriber.is_active = False
    await db.commit()
    return {"message": "Unsubscribed successfully"}
