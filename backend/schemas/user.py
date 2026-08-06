from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    created_at: datetime
    is_verified: bool
    subscription_tier: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class ChildProfileCreate(BaseModel):
    name: str
    date_of_birth: datetime
    gender: Optional[str] = None


class ChildProfileOut(BaseModel):
    id: int
    user_id: int
    name: str
    date_of_birth: datetime
    gender: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    subscription_tier: Optional[str] = None


class SavedArticleCreate(BaseModel):
    article_slug: str


class SavedArticleOut(BaseModel):
    id: int
    user_id: int
    article_slug: str
    saved_at: datetime

    class Config:
        from_attributes = True


class ExpertBookingCreate(BaseModel):
    expert_id: int
    requested_date: datetime
    notes: Optional[str] = None


class ExpertBookingOut(BaseModel):
    id: int
    user_id: int
    expert_id: int
    requested_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
