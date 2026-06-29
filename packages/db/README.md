# @countdown/db

Prisma ORM-schema, migrationer og database-klient til countdown-monorepoet.

## Opsætning

Kopiér `.env` med en gyldig `DATABASE_URL` (PostgreSQL). Prisma læser den via `prisma.config.ts`.

Brug `sslmode=verify-full` i connection string (Prisma Postgres og de fleste hostede databaser). Klienten opgraderer automatisk ældre værdier som `require`, men det er bedst at angive `verify-full` eksplicit for at undgå advarsler fra `pg`.

```bash
pnpm install
pnpm --filter @countdown/db db:generate
```

## Scripts

Kør fra repo-roden med `pnpm --filter @countdown/db <script>`, eller fra `packages/db` med `pnpm <script>`.

| Script | Kommando | Formål |
|--------|----------|--------|
| `db:generate` | `prisma generate` | Generér Prisma-klient efter schema-ændringer |
| `db:migrate` | `prisma migrate dev` | Opret og anvend en ny migration i udvikling |
| `db:push` | `prisma db push` | Synk schema direkte uden migration (kun hurtig prototyping) |

## Skemaændringer (udviklere)

1. Redigér **kun** `prisma/schema.prisma`.
2. Kør migration via CLI:

```bash
pnpm --filter @countdown/db db:migrate
```

3. Angiv et beskrivende migrationsnavn når Prisma beder om det (f.eks. `add_user_role`).
4. Commit både `schema.prisma` og den **autogenererede** mappe under `prisma/migrations/`.

---

## Regler for AI-assistenter og LLM'er

> **Læs dette afsnit før du rører databasen.**

### LLM'er må aldrig køre migrationer

**En LLM må aldrig oprette, anvende eller ændre database-migrationer.** Det er udelukkende udviklerens ansvar.

Det gælder også — især — disse kommandoer:

- `pnpm --filter @countdown/db db:migrate`
- `pnpm --filter @countdown/db db:push`
- `prisma migrate dev`, `prisma migrate deploy`, `prisma db push`

Når schema er ændret, skal LLM'en stoppe og bede udvikleren køre migrationen manuelt.

### Gør altid dette (LLM)

- Ændr databasestruktur **udelukkende** i `prisma/schema.prisma`.
- Efter schema-ændringer: informér udvikleren om at køre `db:migrate` — kør den **ikke** selv.

### Gør aldrig dette (LLM)

- **Kør aldrig** `db:migrate`, `db:push` eller andre Prisma-migrationskommandoer.
- **Opret aldrig** `migration.sql` manuelt.
- **Opret aldrig** en ny mappe under `prisma/migrations/` i hånden.
- **Skriv aldrig** rå SQL til schema-ændringer i stedet for at opdatere `schema.prisma`.
- **Redigér aldrig** en migration der allerede er committet og anvendt — bed udvikleren om en ny migration i stedet.
- **Slet aldrig** eller omdøb eksisterende migrationsmapper for at “rette” historik.

### Hvorfor

Prisma holder `_prisma_migrations`-tabellen synkron med filerne i `prisma/migrations/`. Migrationer påvirker fælles databaser og deploy-historik — derfor skal de altid køres og committes af en udvikler, ikke af en agent.

### Korrekt vs. forkert workflow (LLM)

**Korrekt:**

1. Tilføj felt/model i `schema.prisma`.
2. Bed udvikleren køre `pnpm --filter @countdown/db db:migrate` og committe migrationsfilerne.

**Forkert (må ikke bruges):**

1. LLM'en kører `db:migrate` eller `db:push`.
2. Oprette `prisma/migrations/20260616120000_add_foo/migration.sql` med håndskrevet SQL.
3. Kun ændre schema uden at informere udvikleren om manglende migration.

### Produktion

Til deploy og CI anvendes `prisma migrate deploy` (ikke `migrate dev`). Det kører eksisterende migrationsfiler; det **opretter ikke** nye. Nye migrationer skal altid genereres lokalt med `db:migrate` før merge.

## Fejlfinding

### "The migration `<navn>` was modified after it was applied"

Prisma gemmer en checksum af hver anvendt migration i tabellen `_prisma_migrations`. Hvis indholdet i en allerede anvendt `migration.sql` ændres, matcher checksummen ikke længere, og Prisma stopper og foreslår `migrate reset`.

**Kør aldrig `migrate reset` mod produktionsdatabasen — det sletter al data.**

Årsagen er altid, at en committet/anvendt migration er blevet redigeret bagefter (se reglerne ovenfor — det må ikke ske). Sådan retter du det uden at nulstille databasen:

1. Find den commit, hvor migrationen først blev tilføjet:

```bash
git log --oneline -- packages/db/prisma/migrations/<navn>/migration.sql
```

2. Gendan filen til det indhold, der faktisk blev anvendt (den oprindelige version):

```bash
git checkout <commit> -- packages/db/prisma/migrations/<navn>/migration.sql
```

3. Bekræft at filen nu matcher den anvendte version (tom diff):

```bash
git diff <commit> -- packages/db/prisma/migrations/<navn>/migration.sql
```

Nu matcher checksummen igen, og `db:migrate` kan køres uden reset. Skal indholdet faktisk ændres, så lav en **ny** migration i stedet for at redigere den gamle.

## Struktur

```
packages/db/
├── prisma/
│   ├── schema.prisma      # Eneste kilde til sandhed for databasestruktur
│   └── migrations/        # Kun filer genereret af Prisma CLI
├── prisma.config.ts
└── src/
    ├── client.ts
    └── generated/prisma/  # Genereret klient (kør db:generate)
```

## Eksport

Andre packages importerer klienten via `@countdown/db`.
