# Minigame guide — til LLM-agenter

Læs denne guide før du opretter, ændrer eller registrerer et minigame i `packages/minigame`.

**Referenceimplementering:** `src/games/tower-stack/` — følg samme struktur og ansvarsfordeling.

## Arkitektur

```
Browser (React UI)  →  server actions  →  pure logic  →  signed JWT cookie
```

- **React UI** (`*-game.tsx`) — client component. Viser state og kalder actions. Ingen spilregler i UI.
- **Server actions** (`actions.ts`) — `"use server"`. Læser/skriver session, kalder logic, returnerer public state.
- **Pure logic** (`logic.ts`) — rene funktioner uden Next.js, cookies eller React. Nem at teste.
- **Session cookie** — hemmelig state (fx crash-map, RNG) gemmes i en httpOnly JWT via `session/game-session.ts`. Klienten kan ikke snyde.

**Practice vs competitive:** Samme spil, to cookies (`cookie.ts`). Practice på `/game/[game-id]`. Competitive på `/game` med auth, score-gemning og ekstra guards i `apps/web/lib/minigame/`.

## Mappestruktur pr. spil

Opret `src/games/<game-id>/` med disse filer:

| Fil | Ansvar |
|-----|--------|
| `<game-id>-metadata.ts` | `GAME_ID` konstant + `{ id, title }` objekt |
| `types.ts` | Session-type (hemmelig), public state-type, action result, actions-interface, konstanter |
| `logic.ts` | Spilregler, state transitions, `toPublicState()` |
| `cookie.ts` | Cookie-navne pr. play mode |
| `copy.ts` | Brugertekst (dansk) — hold UI-tekst ude af komponenten |
| `actions.ts` | `"use server"` — `getState`, game actions, `clearSession` |
| `<game-id>-game.tsx` | `"use client"` — React UI |
| `index.ts` | Re-exports til pakken |

**Game ID:** kebab-case, fx `tower-stack`. Bruges i URL (`/game/tower-stack`), registry og manifest.

## State: session vs public

Adskil altid **hemmelig session** fra **public state**:

```ts
// types.ts — session (gemmes i cookie, må indeholde hemmeligheder)
type MyGameSession = {
  phase: "ready" | "playing" | "ended";
  score: number;
  secretOutcome: boolean[]; // fx crash-map — ALDRIG send til klient
};

// types.ts — public (sendes til React)
type MyGamePublicState = {
  phase: "ready" | "playing" | "ended";
  score: number;
  message: string;
  // ingen secretOutcome
};
```

`logic.ts` skal have `toPublicState(session, options?)` der filtrerer hemmeligheder væk.

Action results følger altid samme union:

```ts
type MyGameActionResult =
  | { success: true; state: MyGamePublicState }
  | { success: false; error: string; state: MyGamePublicState };
```

## actions.ts — mønster

1. `readSession(mode)` — læs cookie, validér form, returnér default session ved invalid/missing
2. `persistSession(mode, session)` — skriv cookie via `signGameSession`
3. `getMyGameState(mode)` — returnér `toPublicState(readSession(mode))`
4. Én exported action pr. spiller-handling — læs session, kør logic, persist, returnér result
5. `clearMyGameSession(mode)` — slet cookie (bruges efter competitive score er gemt)

Validér session-shape i actions (se `isValidSession` i reference-spillet). Kast ikke i logic — returnér `{ success: false, error, state }` for ugyldige spiller-handlinger.

## React UI — mønster

```tsx
"use client";

type MyGameProps = {
  initialState: MyGamePublicState;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: MyGameActions; // override til competitive wrappers
};

const defaultActions: MyGameActions = {
  doThing: () => doMyGameThing(),
  reset: () => resetMyGame(),
};
```

- Hold `useState(initialState)` og opdatér fra action results
- Brug `useTransition` om server action calls
- Injicer `actions` prop — competitive mode sender wrapped actions fra web-appen
- Understøt `variant`: `standalone` (fuld side) vs `embedded` (inde i anden layout)
- Importer **ikke** server-only moduler i client-komponenten

## Registrering — checkliste

Når et nyt spil er implementeret, opdatér **alle** disse steder:

### 1. `src/registry.ts`

```ts
[MY_GAME_ID]: {
  id: MY_GAME_ID,
  title: myGame.title,
  getInitialState: (mode = "practice") => getMyGameState(mode),
},
```

Registry kalder `assertManifestCoversRegisteredGames` ved startup — manifest og registry skal matche.

### 2. `games.manifest.json`

```json
{
  "games": {
    "my-game-id": { "active": false }
  }
}
```

- `"active": false` under udvikling (spilbart på direkte URL, men ikke i daglig rotation)
- `"active": true` når spillet er klar til daglig minigame-pool

### 3. `src/minigame-player.tsx`

Tilføj en `if (gameId === MY_GAME_ID)` gren der renderer dit spil.

### 4. `src/index.ts`

Exportér game-komponent, actions, typer og ID.

### 5. `package.json` exports

```json
"./games/my-game-id": "./src/games/my-game-id/index.ts"
```

### 6. `src/games/index.ts`

Re-exportér metadata.

### 7. Competitive mode (kun når spillet skal i daglig rotation)

I `apps/web/lib/minigame/`:

- `competitive-<game-id>-actions.ts` — wrap package actions med auth, "allerede spillet", score-gemning ved `phase === "ended"`
- Opdatér `competitive-minigame-actions.ts` med en gren for dit game ID

Competitive wrapper-mønster:

```ts
const withCompetitiveGuards = async (action) => {
  const { userId, dailyMinigameId } = await requirePlayableSession();
  const result = await action();
  if (result.state.phase === "ended") {
    await saveMinigamePoints(userId, dailyMinigameId, result.state.score);
    await clearMyGameSession("competitive");
  }
  return result;
};
```

Score-feltet skal matche hvad spillet bruger som slutresultat (reference: `bankroll`).

## Fail fast

- **Ingen fallbacks for påkrævede props** — se `apps/web/LLM-FAIL-FAST.md`
- **Ingen client-side spilregler** — RNG, crash-checks og score skal køre i server actions + logic
- **Ingen hemmeligheder i public state** — crash maps, fremtidige udfald, uset kortlag
- **Registry/manifest sync** — app crasher ved startup hvis de ikke matcher
- **Kast `Error`** ved manglende env (`JWT_SECRET`) og ugyldig konfiguration — ikke stille fallbacks

## Daglig minigame

Aktive spil (`games.manifest.json` → `"active": true`) indgår i `minigameIds()`. Hver Københavner-dag vælges ét spil deterministisk (`apps/web/lib/minigame/pick-daily-game.ts`) og gemmes i `DailyMinigame`-tabellen. Alle spillere får samme spil den dag.

Spil med `"active": false` kan stadig testes på `/game/<game-id>` (practice mode).

## Konventioner

- TypeScript — ingen `any`. Return types på top-level modulfunktioner (ikke React-komponenter).
- Prefiks konstanter og typer med game-navn: `TOWER_STACK_MAX_ATTEMPTS`
- Brug `Logger` i web-app — ikke `console.log` (minigame-pakken har ingen Logger endnu)
- Copy på dansk i `copy.ts`
- Pure logic-funktioner skal være deterministiske givet input (undtagen RNG-generering, som sker én gang server-side)

## Hurtig start — nyt spil

1. Kopiér `src/games/tower-stack/` som udgangspunkt
2. Omdøb filer, konstanter og typer til dit spil
3. Erstat logic og UI med dit spilkoncept
4. Behold session/public-adskillelse og action-result-mønsteret
5. Registrér i checklisten ovenfor
6. Sæt `"active": false` i manifest indtil spillet er testet
7. Kør `pnpm --filter @countdown/minigame check-types`

## Test manuelt

- Practice: `/game/<game-id>` — fuld reset, ingen auth
- Competitive: `/game` — kræver login, gemmer score én gang, ingen reset
- Verificér at cookie-state overlever page refresh i practice mode
- Verificér at invalid/manipuleret cookie giver fresh session (ikke crash)
