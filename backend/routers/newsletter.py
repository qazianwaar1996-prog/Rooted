from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


class NewsletterSubscribe(BaseModel):
    email: EmailStr


@router.post("/subscribe")
async def subscribe(sub: NewsletterSubscribe):
    # In a production environment, this would add to an email service (e.g. Mailchimp, SendGrid)
    # For this backend, we simply return a success message confirming subscription.
    return {"message": f"Subscribed successfully: {sub.email}"}
