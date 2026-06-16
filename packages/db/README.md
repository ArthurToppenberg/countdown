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

## Skemaændringer (mennesker og agenter)

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

### Gør altid dette

- Ændr databasestruktur **udelukkende** i `prisma/schema.prisma`.
- Opret migrationer **udelukkende** med Prisma CLI:

```bash
pnpm --filter @countdown/db db:migrate
```

- Lad Prisma generere migrationsmappen (tidsstempel + navn) og `migration.sql`.
- Kør `db:generate` efter schema-ændringer, hvis `migrate dev` ikke allerede har gjort det.

### Gør aldrig dette

- **Opret aldrig** `migration.sql` manuelt.
- **Opret aldrig** en ny mappe under `prisma/migrations/` i hånden.
- **Skriv aldrig** rå SQL til schema-ændringer i stedet for at opdatere `schema.prisma`.
- **Redigér aldrig** en migration der allerede er committet og anvendt — lav en ny migration i stedet.
- **Slet aldrig** eller omdøb eksisterende migrationsmapper for at “rette” historik.

### Hvorfor

Prisma holder `_prisma_migrations`-tabellen synkron med filerne i `prisma/migrations/`. Manuelle SQL-filer giver ofte checksum-fejl, manglende historik og divergerende schema mellem miljøer. CLI'en sikrer korrekt SQL, rækkefølge og checksum.

### Korrekt vs. forkert workflow

**Korrekt:**

1. Tilføj felt/model i `schema.prisma`.
2. `pnpm --filter @countdown/db db:migrate`
3. Commit schema + ny autogenereret migrationsmappe.

**Forkert (må ikke bruges):**

1. Oprette `prisma/migrations/20260616120000_add_foo/migration.sql` med håndskrevet SQL.
2. Kun ændre schema uden at køre `db:migrate`.
3. Bruge `db:push` til ændringer der skal deployes — brug `db:migrate` til varige schema-ændringer.

### Produktion

Til deploy og CI anvendes `prisma migrate deploy` (ikke `migrate dev`). Det kører eksisterende migrationsfiler; det **opretter ikke** nye. Nye migrationer skal altid genereres lokalt med `db:migrate` før merge.

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
