# Rooted — Production Deployment Checklist

## 1. ENVIRONMENT VARIABLES (Railway)

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Railway auto-provides this |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` | Generate a strong random key |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe dashboard → Webhooks |
| `STRIPE_PREMIUM_PRICE_ID` | `price_...` | Stripe dashboard → Products |
| `RESEND_API_KEY` | `re_...` | resend.com → API Keys |
| `FRONTEND_URL` | `https://rooted-parenting.com` | Your custom domain |
| `ADMIN_EMAILS` | `you@yourdomain.com` | Comma-separated admin emails |
| `DB_ECHO` | `false` | Disable SQL logging |

## 2. GITHUB PAGES AUTO-DEPLOY

Saved at `.github/workflows/deploy.yml`. On push to `main`:
- Checks out code → npm ci → npm run build
- Uploads `dist/` as Pages artifact
- Deploys via `actions/deploy-pages@v4`

Setup: Repo Settings → Pages → Source: GitHub Actions.

## 3. CUSTOM DOMAIN

### DNS Records

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   <username>.github.io
```

### CNAME File

`public/CNAME` already contains `rooted-parenting.com`. Enable "Enforce HTTPS" in repo Settings → Pages.

## 4. RAILWAY DEPLOYMENT

1. New Project → Deploy from GitHub → select repo
2. Add PostgreSQL plugin (auto-injects DATABASE_URL)
3. Set Root Directory to `backend`
4. Push to main → auto-deploys
5. Stripe webhook: point to `https://<app>.up.railway.app/payments/webhook`

## 5. POST-DEPLOY CHECKS

- [ ] Register → welcome email arrives
- [ ] Login → JWT works
- [ ] Upgrade to Premium → Stripe redirect works
- [ ] `/sitemap.xml` and `/robots.txt` return correctly
- [ ] OG tags verify at opengraph.xyz
- [ ] Lighthouse: 90+ SEO, 80+ Performance
