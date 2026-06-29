# @countdown/minigame

Shared minigame definitions, server-side game logic, and React UI for Countdown.

## Architecture

- **React UI** — client components render the game board
- **Server actions** — all game state changes run on the server
- **Signed httpOnly cookie** — game session state is stored server-side in a JWT cookie (no DB during play)

**The client cannot be trusted.** Block positions, overlap checks, scoring, and attempt limits are computed in server actions and pure logic (`logic.ts`). The UI only sends player intents (e.g. "drop block") and animates the last known server state — it never decides whether a placement succeeded or how many points to award.

This prevents clients from tampering with outcomes, scores, or remaining attempts.

## Usage

```tsx
import {
  TowerStackGame,
  getTowerStackState,
} from "@countdown/minigame/games/tower-stack";

const initialState = await getTowerStackState();

return <TowerStackGame initialState={initialState} />;
```

## Playing games

Each game is playable at `/game/[game-id]` (for example `/game/tower-stack`). Register new games in `src/registry.ts`.

## Activating games

`games.manifest.json` at the package root is the master list of games. Set `"active": true` to include a game in the daily rotation pool and public listings; set `"active": false` to hide it while keeping it playable at its direct URL for development.

Every game registered in `src/registry.ts` must have a matching entry in `games.manifest.json`. The app fails fast at startup if the manifest and registry are out of sync.

## Daily minigame selection

Each Copenhagen calendar day, one active game is picked deterministically and stored in the `DailyMinigame` database table. All players get the same game that day. Selection uses `minigameIds()` (active games only) and a salted date hash (`DAILY_MINIGAME_SALT` or `JWT_SECRET` in the web app).

## Adding a new game

See **`LLM-GAME-GUIDE.md`** for the full LLM-oriented guide (architecture, file structure, registration checklist, competitive mode).

Quick version:

1. Create `src/games/your-game/` following `tower-stack/` as reference
2. Register the game in `src/registry.ts`
3. Add an entry to `games.manifest.json` (use `"active": false` until the game is ready)
4. Wire up `minigame-player.tsx`, exports, and competitive wrappers in `apps/web/lib/minigame/`

## Environment

Uses `JWT_SECRET` (same as auth) to sign game session cookies.
