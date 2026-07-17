# ExamForge

> Forge your English. Beat the exam.

Interactive B2 First practice platform. Built with Next.js 16, TypeScript, Prisma + PostgreSQL.

## Features

- **Auth**: Anonymous try-out + email/OAuth accounts
- **Practice Mode**: Pausable, hints, part-based navigation
- **Mock Mode**: Timed, strict, auto-submit, server-authoritative timer
- **Auto-Correction**: Multiple choice, cloze, word formation, transformations, more
- **Cambridge Scale**: Estimated scoring with lookup tables
- **Writing Evaluation**: 4-criterion rubric (Content, CA, Organisation, Language)
- **Dashboard**: Accuracy charts, streaks, achievements, leaderboard, personal goals
- **Admin Panel**: Question bank, content management, user roles

## Tech Stack

- Next.js 16 (App Router) + TypeScript 5
- Prisma + Neon PostgreSQL
- Auth.js v5 (Credentials + Google + GitHub)
- Tailwind CSS v4 + shadcn/ui
- Vitest

## Legal

> Independent practice platform. Not affiliated with or endorsed by Cambridge University or Cambridge English.

## Getting Started

```bash
bun install
cp .env.example .env  # configure DATABASE_URL + AUTH_SECRET + OAuth keys
npx prisma db push
npx prisma db seed
bun run dev
```
