"""Pydantic schemas for community endpoints."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PostCreate(BaseModel):
    group_id: str = Field(default="toddler")
    body: str = Field(..., min_length=1, max_length=500)
    image_url: Optional[str] = None
    is_anonymous: bool = False


class PostOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    group_id: str
    body: str
    image_url: Optional[str] = None
    is_anonymous: bool
    like_count: int
    comment_count: int
    created_at: datetime
    author_name: Optional[str] = "Anonymous Parent"
    author_initial: Optional[str] = "A"
    stage_label: Optional[str] = None

    class Config:
        from_attributes = True


class PostList(BaseModel):
    posts: List[PostOut]
    page: int
    total: int
    has_more: bool


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=500)
    parent_id: Optional[int] = None
    is_anonymous: bool = False


class CommentOut(BaseModel):
    id: int
    post_id: int
    user_id: Optional[int] = None
    parent_id: Optional[int] = None
    body: str
    is_anonymous: bool
    like_count: int
    created_at: datetime
    author_name: Optional[str] = "Anonymous Parent"
    author_initial: Optional[str] = "A"
    replies: List["CommentOut"] = []

    class Config:
        from_attributes = True


CommentOut.model_rebuild()


class GroupOut(BaseModel):
    id: str
    name: str
    description: str
    stage_range: str
    member_count: int
    icon: str = "👶"
