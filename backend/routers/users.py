from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import User, ChildProfile, SavedArticle
from schemas.user import UserProfileUpdate, ChildProfileCreate, ChildProfileOut, SavedArticleOut
from auth.security import decode_token
from routers.auth import oauth2_scheme

router = APIRouter(prefix="/users", tags=["users"])


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/me/profile", response_model=dict)
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_verified": user.is_verified,
        "subscription_tier": user.subscription_tier,
        "created_at": user.created_at,
    }


@router.put("/me/profile")
async def update_profile(
    update: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if update.name is not None:
        user.name = update.name
    if update.subscription_tier is not None:
        user.subscription_tier = update.subscription_tier
    await db.commit()
    return {"message": "Profile updated"}


@router.post("/me/children", response_model=ChildProfileOut)
async def add_child(
    child: ChildProfileCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    child_profile = ChildProfile(
        user_id=user.id,
        name=child.name,
        date_of_birth=child.date_of_birth,
        gender=child.gender,
    )
    db.add(child_profile)
    await db.commit()
    await db.refresh(child_profile)
    return child_profile


@router.get("/me/children", response_model=List[ChildProfileOut])
async def list_children(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ChildProfile).where(ChildProfile.user_id == user.id))
    return result.scalars().all()


@router.delete("/me/children/{child_id}")
async def delete_child(
    child_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChildProfile).where(ChildProfile.id == child_id, ChildProfile.user_id == user.id)
    )
    child = result.scalars().first()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    await db.delete(child)
    await db.commit()
    return {"message": "Child profile deleted"}


@router.post("/me/saved-articles/{slug}")
async def save_article(
    slug: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == user.id,
            SavedArticle.article_slug == slug,
        )
    )
    existing = result.scalars().first()
    if existing:
        return {"message": "Already saved"}
    saved = SavedArticle(user_id=user.id, article_slug=slug)
    db.add(saved)
    await db.commit()
    return {"message": "Article saved"}


@router.get("/me/saved-articles", response_model=List[SavedArticleOut])
async def list_saved_articles(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SavedArticle).where(SavedArticle.user_id == user.id))
    return result.scalars().all()


@router.delete("/me/saved-articles/{slug}")
async def delete_saved_article(
    slug: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == user.id,
            SavedArticle.article_slug == slug,
        )
    )
    saved = result.scalars().first()
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved article not found")
    await db.delete(saved)
    await db.commit()
    return {"message": "Saved article removed"}
