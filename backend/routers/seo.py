"""SEO router — serves sitemap.xml and robots.txt."""

import os
from datetime import datetime
from fastapi import APIRouter, Response

router = APIRouter(tags=["seo"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://rooted-parenting.com")

# ── Static page routes ────────────────────────────────────────
STATIC_ROUTES = [
    {"loc": "/", "priority": "1.0", "changefreq": "daily"},
    {"loc": "/articles", "priority": "0.9", "changefreq": "daily"},
    {"loc": "/courses", "priority": "0.7", "changefreq": "weekly"},
    {"loc": "/community", "priority": "0.8", "changefreq": "daily"},
    {"loc": "/resources", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/resources/milestone-tracker", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/resources/screen-time", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/resources/quiz", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "/experts", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "/about", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "/pricing", "priority": "0.7", "changefreq": "weekly"},
    {"loc": "/login", "priority": "0.4", "changefreq": "monthly"},
    {"loc": "/register", "priority": "0.4", "changefreq": "monthly"},
]

# ── Article slugs (synced with the static JSON data) ──────────
ARTICLE_SLUGS = [
    "screen-time-by-age-2026-complete-guide",
    "how-to-talk-to-your-child-about-ai",
    "why-your-toddler-says-no-to-everything",
    "toddler-milestones-at-18-months-whats-normal",
    "why-your-child-wont-sleep-and-what-actually-works",
    "discipline-without-yelling-7-techniques-that-work",
    "raising-emotionally-resilient-kids-in-2026",
    "signs-your-child-has-anxiety-and-what-to-do",
    "how-to-raise-kids-who-are-smarter-than-ai",
    "honest-screen-time-rules-for-2026",
    "age-by-age-guide-to-child-development-0-12",
    "what-to-do-when-your-child-has-tantrums-in-public",
]

# ── Expert IDs ────────────────────────────────────────────────
EXPERT_IDS = list(range(1, 9))  # 8 experts


@router.get("/sitemap.xml")
async def sitemap():
    """Dynamically generate XML sitemap."""
    today = datetime.utcnow().strftime("%Y-%m-%d")

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    # Static pages
    for route in STATIC_ROUTES:
        xml.append("  <url>")
        xml.append(f"    <loc>{FRONTEND_URL}{route['loc']}</loc>")
        xml.append(f"    <lastmod>{today}</lastmod>")
        xml.append(f"    <changefreq>{route['changefreq']}</changefreq>")
        xml.append(f"    <priority>{route['priority']}</priority>")
        xml.append("  </url>")

    # Article pages
    for slug in ARTICLE_SLUGS:
        xml.append("  <url>")
        xml.append(f"    <loc>{FRONTEND_URL}/articles/{slug}</loc>")
        xml.append(f"    <lastmod>{today}</lastmod>")
        xml.append("    <changefreq>weekly</changefreq>")
        xml.append("    <priority>0.85</priority>")
        xml.append("  </url>")

    # Expert profiles
    for eid in EXPERT_IDS:
        xml.append("  <url>")
        xml.append(f"    <loc>{FRONTEND_URL}/experts/{eid}</loc>")
        xml.append(f"    <lastmod>{today}</lastmod>")
        xml.append("    <changefreq>monthly</changefreq>")
        xml.append("    <priority>0.75</priority>")
        xml.append("  </url>")

    xml.append("</urlset>")

    return Response(content="\n".join(xml), media_type="application/xml")


@router.get("/robots.txt")
async def robots():
    """Serve robots.txt allowing all crawlers and pointing to the sitemap."""
    content = f"""User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /onboarding
Disallow: /login
Disallow: /register
Disallow: /pricing/success

Sitemap: {FRONTEND_URL}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")
