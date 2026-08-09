# ExamForge — Deployment Guide

## Quick Start

### Option A: Vercel (recommended)

1. Push repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js — no config needed (vercel.json handles it)
5. Add environment variables in Vercel dashboard:

```
DATABASE_URL=postgresql://user:pass@host:5432/opensloth
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
NLM_PATH=nlm
```

6. Deploy

**Note**: Neon PostgreSQL works out of the box with Vercel — no Docker needed for the database.

### Option B: Docker

```bash
# Start Postgres + app
docker-compose up --build

# App runs on http://localhost:3000
# Postgres on localhost:5432
```

### Option C: Standalone (manual)

```bash
bun run build
cd .next/standalone
node server.js
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js secret (generate: `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `AUTH_GITHUB_ID` | No | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | No | GitHub OAuth client secret |
| `NLM_PATH` | No | Path to nlm CLI (default: `nlm`) |

## Post-Deploy Checklist

- [ ] Run `bun run db:push` to apply schema changes
- [ ] Run `bun run db:seed` to populate exam data
- [ ] Verify auth works (login/register)
- [ ] Verify admin panel access (role: ADMIN)
- [ ] Test NotebookLM generation (requires nlm CLI configured)

## SEO

- `src/app/sitemap.ts` — Dynamic sitemap (add more routes as needed)
- `src/app/robots.txt` — Blocks /admin/, /api/, /auth/ from crawlers
- Update `NEXT_PUBLIC_APP_URL` env var for production domain

## Architecture Notes

- **Standalone output**: next.config.ts has `output: "standalone"` for Docker support
- **Rate limiter**: Currently in-memory — swap for Redis in production if scaling horizontally
- **Database**: Neon PostgreSQL (serverless) for Vercel, Docker Postgres for local
