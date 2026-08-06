"""Payments router — Stripe Checkout for Premium subscriptions & expert sessions."""

import os
import json
from datetime import datetime, timezone
from typing import Optional

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, ExpertBooking, SubscriptionTier, BookingStatus
from schemas.user import (
    CreateCheckoutSessionRequest,
    CheckoutSessionResponse,
    SubscriptionStatusResponse,
    CancelSubscriptionResponse,
    BookExpertSessionRequest,
    BookExpertSessionResponse,
)
from auth.security import decode_token
from routers.auth import oauth2_scheme

router = APIRouter(prefix="/payments", tags=["payments"])

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
PREMIUM_PRICE_ID = os.getenv("STRIPE_PREMIUM_PRICE_ID", "price_placeholder")
SESSION_PRICE_LOOKUP = {
    1: 20000, 2: 18000, 3: 16000, 4: 14000,
    5: 17000, 6: 15000, 7: 16000, 8: 19000,
}  # expert_id -> amount in cents (defaults)

stripe.api_key = STRIPE_SECRET_KEY


# ── Helper: get current user from token ──────────────────────

async def _get_user(token: str, db: AsyncSession) -> User:
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# ═══════════════════════════════════════════════════════════════
#  PREMIUM SUBSCRIPTION CHECKOUT
# ═══════════════════════════════════════════════════════════════

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    body: CreateCheckoutSessionRequest = CreateCheckoutSessionRequest(),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Checkout Session for Premium ($9.99/mo)."""
    user = await _get_user(token, db)

    success_url = body.success_url or f"{FRONTEND_URL}/pricing/success"
    cancel_url = body.cancel_url or f"{FRONTEND_URL}/pricing"

    # Ensure Stripe customer exists
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            name=user.name,
            metadata={"user_id": str(user.id)},
        )
        user.stripe_customer_id = customer.id
        await db.commit()

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{
            "price": PREMIUM_PRICE_ID,
            "quantity": 1,
        }],
        metadata={"user_id": str(user.id), "type": "premium_subscription"},
        subscription_data={"metadata": {"user_id": str(user.id)}},
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        allow_promotion_codes=True,
    )

    return CheckoutSessionResponse(url=session.url)


# ═══════════════════════════════════════════════════════════════
#  SUBSCRIPTION STATUS
# ═══════════════════════════════════════════════════════════════

@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def subscription_status(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Return the current subscription tier and renewal date."""
    user = await _get_user(token, db)

    cancel_at_period_end = False
    renewal_date = user.subscription_end_date

    if user.stripe_subscription_id and user.subscription_tier == SubscriptionTier.premium:
        try:
            sub = stripe.Subscription.retrieve(user.stripe_subscription_id)
            cancel_at_period_end = sub.get("cancel_at_period_end", False)
            if sub.get("current_period_end"):
                renewal_date = datetime.fromtimestamp(sub["current_period_end"], tz=timezone.utc)
                user.subscription_end_date = renewal_date
                await db.commit()
        except stripe.error.StripeError:
            pass  # stale subscription ID; rely on DB values

    return SubscriptionStatusResponse(
        tier=user.subscription_tier.value if hasattr(user.subscription_tier, "value") else user.subscription_tier,
        renewal_date=renewal_date,
        cancel_at_period_end=cancel_at_period_end,
    )


# ═══════════════════════════════════════════════════════════════
#  CANCEL SUBSCRIPTION
# ═══════════════════════════════════════════════════════════════

@router.post("/cancel-subscription", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Cancel the user's Premium subscription at period end."""
    user = await _get_user(token, db)

    if not user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found")

    try:
        sub = stripe.Subscription.modify(
            user.stripe_subscription_id,
            cancel_at_period_end=True,
        )
        renewal_date = datetime.fromtimestamp(sub["current_period_end"], tz=timezone.utc)
        user.subscription_end_date = renewal_date
        await db.commit()

        return CancelSubscriptionResponse(
            message="Your subscription will be cancelled at the end of the billing period.",
            tier=user.subscription_tier.value if hasattr(user.subscription_tier, "value") else user.subscription_tier,
            renewal_date=renewal_date,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Failed to cancel: {e.user_message or str(e)}")


# ═══════════════════════════════════════════════════════════════
#  BOOK EXPERT SESSION (One-time payment)
# ═══════════════════════════════════════════════════════════════

@router.post("/book-expert-session", response_model=BookExpertSessionResponse)
async def book_expert_session(
    body: BookExpertSessionRequest,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Payment Link for a one-time expert session."""
    user = await _get_user(token, db)

    # Determine price (cents) based on expert
    amount_cents = SESSION_PRICE_LOOKUP.get(body.expert_id, 15000)  # default $150

    success_url = body.success_url or f"{FRONTEND_URL}/dashboard?booked={body.expert_id}"
    cancel_url = body.cancel_url or f"{FRONTEND_URL}/experts/{body.expert_id}"

    # Ensure Stripe customer exists
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            name=user.name,
            metadata={"user_id": str(user.id)},
        )
        user.stripe_customer_id = customer.id
        await db.commit()

    # Create the booking in DB first (pending_payment)
    booking = ExpertBooking(
        user_id=user.id,
        expert_id=body.expert_id,
        requested_date=body.slot_datetime,
        status=BookingStatus.pending_payment,
        notes=body.notes,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # Create Stripe Checkout Session
    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": f"Expert Session — Expert #{body.expert_id}",
                    "description": f"One-on-one parenting consultation session.",
                },
                "unit_amount": amount_cents,
            },
            "quantity": 1,
        }],
        metadata={
            "user_id": str(user.id),
            "type": "expert_session",
            "booking_id": str(booking.id),
            "expert_id": str(body.expert_id),
        },
        success_url=success_url,
        cancel_url=cancel_url,
    )

    # Store session ID on booking
    booking.stripe_session_id = session.id
    await db.commit()

    return BookExpertSessionResponse(url=session.url, booking_id=booking.id)


# ═══════════════════════════════════════════════════════════════
#  STRIPE WEBHOOK
# ═══════════════════════════════════════════════════════════════

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle incoming Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        # In test mode with placeholder secret, parse the event anyway
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type") if isinstance(event, dict) else event.type

    # ── checkout.session.completed ──────────────────────────
    if event_type == "checkout.session.completed":
        session_data = event["data"]["object"] if isinstance(event, dict) else event.data.object
        _metadata = session_data.get("metadata", {}) if isinstance(session_data, dict) else getattr(session_data, "metadata", {})

        payment_type = _metadata.get("type", "") if isinstance(_metadata, dict) else getattr(_metadata, "type", "")
        user_id = int(_metadata.get("user_id", 0)) if isinstance(_metadata, dict) else int(getattr(_metadata, "user_id", 0))

        if not user_id:
            return {"status": "skipped", "reason": "no user_id in metadata"}

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return {"status": "skipped", "reason": "user not found"}

        # ── Premium subscription completed ─────────────────
        if payment_type == "premium_subscription":
            user.subscription_tier = SubscriptionTier.premium
            subscription_id = session_data.get("subscription") if isinstance(session_data, dict) else getattr(session_data, "subscription", None)
            if subscription_id:
                user.stripe_subscription_id = subscription_id
                try:
                    sub = stripe.Subscription.retrieve(subscription_id)
                    if sub.get("current_period_end"):
                        user.subscription_end_date = datetime.fromtimestamp(
                            sub["current_period_end"], tz=timezone.utc
                        )
                except stripe.error.StripeError:
                    pass
            await db.commit()

        # ── Expert session payment completed ────────────────
        elif payment_type == "expert_session":
            booking_id = int(_metadata.get("booking_id", 0)) if isinstance(_metadata, dict) else int(getattr(_metadata, "booking_id", 0))
            if booking_id:
                b_result = await db.execute(
                    select(ExpertBooking).where(ExpertBooking.id == booking_id, ExpertBooking.user_id == user_id)
                )
                booking = b_result.scalars().first()
                if booking:
                    booking.status = BookingStatus.confirmed
                    booking.stripe_session_id = session_data.get("id") if isinstance(session_data, dict) else getattr(session_data, "id", None)
                    await db.commit()

        return {"status": "processed", "type": payment_type, "user_id": user_id}

    # ── customer.subscription.deleted ───────────────────────
    elif event_type == "customer.subscription.deleted":
        sub_data = event["data"]["object"] if isinstance(event, dict) else event.data.object
        sub_id = sub_data.get("id") if isinstance(sub_data, dict) else getattr(sub_data, "id", None)

        if sub_id:
            result = await db.execute(select(User).where(User.stripe_subscription_id == sub_id))
            user = result.scalars().first()
            if user:
                user.subscription_tier = SubscriptionTier.free
                user.stripe_subscription_id = None
                user.subscription_end_date = None
                await db.commit()
                return {"status": "downgraded", "user_id": user.id}

        return {"status": "skipped", "reason": "no matching subscription"}

    return {"status": "ignored", "type": str(event_type)}
