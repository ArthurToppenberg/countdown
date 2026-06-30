# countdown

Turborepo monorepo managed with pnpm.

## Setup

```bash
pnpm install
```

## Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm check-types  # Typecheck all packages
pnpm clean        # Remove build outputs and Turbo cache
```

## Apps

- `apps/web` — Next.js web app

## Packages

- `packages/db` — Prisma ORM schema, migrations, and database client (Prisma Postgres)
- `packages/email` — React Email templates and Resend send helpers
- `packages/game` — Game definitions, result types, and game logic
- `packages/ui` — Shared shadcn/ui components, theme, and utilities

### Adding UI components

From `apps/web`, add shadcn components into the shared UI package:

```bash
pnpm --filter web exec shadcn add button card
```

## Deploy on Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Vercel detects Turborepo via `turbo.json` at the repo root and enables remote caching automatically.