"""Community models — posts, comments, likes, groups."""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class PostGroup(str, enum.Enum):
    expecting = "expecting"
    newborn = "newborn"
    toddler = "toddler"
    preschool = "preschool"
    school_age = "school_age"
    tween_teen = "tween_teen"
    ai_age = "ai_age"


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    group_id = Column(
        SAEnum(PostGroup, name="post_group"),
        default=PostGroup.toddler,
        nullable=False,
        index=True,
    )
    body = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="community_posts")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan", order_by="CommunityComment.created_at")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_id = Column(Integer, ForeignKey("community_comments.id", ondelete="CASCADE"), nullable=True)
    body = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("CommunityPost", back_populates="comments")
    user = relationship("User", backref="community_comments")
    replies = relationship("CommunityComment", backref="parent", remote_side=[id], cascade="all, delete-orphan", order_by="CommunityComment.created_at")
