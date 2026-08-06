from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import ExpertBooking
from schemas.user import ExpertBookingCreate, ExpertBookingOut
from routers.users import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=ExpertBookingOut)
async def create_booking(
    booking: ExpertBookingCreate,
    user: type = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_booking = ExpertBooking(
        user_id=user.id,
        expert_id=booking.expert_id,
        requested_date=booking.requested_date,
        notes=booking.notes,
    )
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    return new_booking


@router.get("/me", response_model=List[ExpertBookingOut])
async def list_my_bookings(
    user: type = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ExpertBooking).where(ExpertBooking.user_id == user.id)
    )
    return result.scalars().all()


@router.get("/{booking_id}", response_model=ExpertBookingOut)
async def get_booking(
    booking_id: int,
    user: type = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ExpertBooking).where(
            ExpertBooking.id == booking_id,
            ExpertBooking.user_id == user.id,
        )
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking
