"""Community router — posts, comments, groups."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sa_func
from typing import Optional

from database import get_db
from models import User
from models.community import CommunityPost, CommunityComment, PostGroup
from schemas.community import PostCreate, PostOut, PostList, CommentCreate, CommentOut, GroupOut
from auth.security import decode_token
from routers.auth import oauth2_scheme

router = APIRouter(prefix="/community", tags=["community"])

STAGE_LABEL_MAP = {
    "expecting": "Expecting Parent",
    "newborn": "Newborn (0–12m)",
    "toddler": "Toddler (1–3y)",
    "preschool": "Preschool (3–5y)",
    "school_age": "School Age (6–12y)",
    "tween_teen": "Tween & Teen (13+)",
    "ai_age": "AI Age Parenting",
}


def _post_to_out(post: CommunityPost) -> PostOut:
    """Convert a CommunityPost ORM object to PostOut, even if user is None."""
    if post.user:
        author_name = "Anonymous Parent" if post.is_anonymous else post.user.name
        author_initial = author_name[0].upper()
    else:
        author_name = "Anonymous Parent"
        author_initial = "A"

    return PostOut(
        id=post.id,
        user_id=post.user_id,
        group_id=post.group_id.value if hasattr(post.group_id, "value") else post.group_id,
        body=post.body,
        image_url=post.image_url,
        is_anonymous=post.is_anonymous,
        like_count=post.like_count,
        comment_count=post.comment_count,
        created_at=post.created_at,
        author_name=author_name,
        author_initial=author_initial,
        stage_label=STAGE_LABEL_MAP.get(
            post.group_id.value if hasattr(post.group_id, "value") else post.group_id, ""
        ),
    )


def _comment_to_out(comment: CommunityComment) -> CommentOut:
    if comment.user:
        author_name = "Anonymous Parent" if comment.is_anonymous else comment.user.name
        author_initial = author_name[0].upper()
    else:
        author_name = "Anonymous Parent"
        author_initial = "A"

    replies = [_comment_to_out(r) for r in (comment.replies or [])]

    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        body=comment.body,
        is_anonymous=comment.is_anonymous,
        like_count=comment.like_count,
        created_at=comment.created_at,
        author_name=author_name,
        author_initial=author_initial,
        replies=replies,
    )


# ── Optional auth helper ────────────────────────────────────

async def get_optional_user(token: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Returns current user if token is valid, else None."""
    if not token:
        return None
    email = decode_token(token)
    if not email:
        return None
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


# ── Groups ───────────────────────────────────────────────────

@router.get("/groups", response_model=list[GroupOut])
async def list_groups():
    return [
        GroupOut(id="expecting", name="Expecting Parents", description="For parents preparing for their little one.", stage_range="Pregnancy", member_count=2847, icon="🤰"),
        GroupOut(id="newborn", name="Newborn", description="Sleep, feeding, and those precious first months.", stage_range="0–12m", member_count=5421, icon="🍼"),
        GroupOut(id="toddler", name="Toddler", description="Tantrums, milestones, and first words.", stage_range="1–3y", member_count=7832, icon="🧸"),
        GroupOut(id="preschool", name="Preschool", description="Social skills, creativity, and preparing for school.", stage_range="3–5y", member_count=6104, icon="🎨"),
        GroupOut(id="school_age", name="School Age", description="Friendships, homework, and growing independence.", stage_range="6–12y", member_count=4376, icon="📚"),
        GroupOut(id="tween_teen", name="Tween & Teen", description="Navigating adolescence together.", stage_range="13+", member_count=3891, icon="🌟"),
        GroupOut(id="ai_age", name="AI Age Parenting", description="Raising kids in the era of artificial intelligence.", stage_range="All ages", member_count=5123, icon="🤖"),
    ]


# ── Posts ────────────────────────────────────────────────────

@router.get("/posts", response_model=PostList)
async def list_posts(
    group_id: Optional[str] = Query(None, description="Filter by group slug"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    base_q = select(CommunityPost)
    count_q = select(sa_func.count(CommunityPost.id))

    if group_id and group_id != "all":
        base_q = base_q.where(CommunityPost.group_id == group_id)
        count_q = count_q.where(CommunityPost.group_id == group_id)

    # Count
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    # Fetch page
    offset = (page - 1) * per_page
    result = await db.execute(
        base_q.order_by(CommunityPost.created_at.desc()).offset(offset).limit(per_page)
    )
    posts = result.scalars().all()

    return PostList(
        posts=[_post_to_out(p) for p in posts],
        page=page,
        total=total,
        has_more=(offset + per_page) < total,
    )


@router.post("/posts", response_model=PostOut)
async def create_post(
    data: PostCreate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    post = CommunityPost(
        user_id=user.id,
        group_id=data.group_id,
        body=data.body,
        image_url=data.image_url,
        is_anonymous=data.is_anonymous,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return _post_to_out(post)


@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _post_to_out(post)


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.like_count = (post.like_count or 0) + 1
    await db.commit()
    return {"like_count": post.like_count}


# ── Comments ─────────────────────────────────────────────────

@router.get("/posts/{post_id}/comments", response_model=list[CommentOut])
async def list_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CommunityComment)
        .where(CommunityComment.post_id == post_id, CommunityComment.parent_id == None)  # noqa: E711
        .order_by(CommunityComment.created_at)
    )
    top_level = result.scalars().all()
    return [_comment_to_out(c) for c in top_level]


@router.post("/posts/{post_id}/comments", response_model=CommentOut)
async def create_comment(
    post_id: int,
    data: CommentCreate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify post exists
    post_result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = post_result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Verify parent comment exists if provided
    if data.parent_id:
        pc_result = await db.execute(
            select(CommunityComment).where(
                CommunityComment.id == data.parent_id,
                CommunityComment.post_id == post_id,
                CommunityComment.parent_id == None,  # noqa: E711 – only 1 level
            )
        )
        if not pc_result.scalars().first():
            raise HTTPException(status_code=400, detail="Invalid parent comment (replies limited to 1 level)")

    comment = CommunityComment(
        post_id=post_id,
        user_id=user.id,
        parent_id=data.parent_id,
        body=data.body,
        is_anonymous=data.is_anonymous,
    )
    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    await db.commit()
    await db.refresh(comment)
    return _comment_to_out(comment)
