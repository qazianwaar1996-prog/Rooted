import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Rooted Backend",
    description="FastAPI backend for Rooted parenting platform",
    version="1.0.0",
)

# CORS for GitHub Pages frontend
frontend_url = os.getenv("FRONTEND_URL", "https://rooted-app.github.io")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, users, bookings, newsletter, community, payments, seo, emails, admin

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(newsletter.router)
app.include_router(community.router)
app.include_router(payments.router)
app.include_router(seo.router)
app.include_router(emails.router)
app.include_router(admin.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Rooted Backend"}
