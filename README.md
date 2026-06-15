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

## Deploy on Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Vercel detects Turborepo via `turbo.json` at the repo root and enables remote caching automatically.