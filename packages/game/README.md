# @countdown/game

Shared game definitions, server-side game logic, and React UI for Countdown.

## Architecture

- **Pure logic** (`logic.ts`) — deterministic, framework-free game rules (oscillation, fall, collision, camera, kill zone, scoring, attempts). Shared by client and server.
- **Client engine** (`use-tower-stack-engine.ts`) — runs the entire simulation locally in a single `requestAnimationFrame` loop. There are **no server round-trips during play**, so gameplay never waits on the network.
- **One submission at the end** — when the game ends, the client posts `{ score, replay }` to a per-mode submit action.

### Trust model

Play is client-driven for a smooth experience, but the result is meant to be **server-verifiable**. The `replay` is a deterministic input log (per attempt: each block's locked x-position and the millisecond it was locked). Because the server has the same pure `logic.ts`, it can re-simulate the inputs and recompute the authoritative score, then reject mismatches.

> Current status: server-side replay verification is **not yet implemented** — the submit action trusts the client `score` (see the `TODO` in `apps/web/lib/game/competitive-tower-stack-actions.ts`). Competitive double-submits are still blocked by the unique `(dailyGameId, userId)` constraint.

## Usage

```tsx
import {
  TowerStackGame,
  getTowerStackState,
} from "@countdown/game/games/tower-stack";

const initialState = await getTowerStackState();

return <TowerStackGame initialState={initialState} />;
```

## Playing games

Each game is playable at `/game/[game-id]` (for example `/game/tower-stack`). Register new games in `src/registry.ts`.

## Activating games

`games.manifest.json` at the package root is the master list of games. Set `"active": true` to include a game in the daily rotation pool and public listings; set `"active": false` to hide it while keeping it playable at its direct URL for development.

Every game registered in `src/registry.ts` must have a matching entry in `games.manifest.json`. The app fails fast at startup if the manifest and registry are out of sync.

## Daily game selection

Each Copenhagen calendar day, one active game is picked deterministically and stored in the `DailyGame` database table. All players get the same game that day. Selection uses `gameIds()` (active games only) and a salted date hash (`DAILY_GAME_SALT` or `JWT_SECRET` in the web app).

## Adding a new game

Use `tower-stack/` as the reference implementation.

Quick version:

1. Create `src/games/your-game/` following `tower-stack/` (pure `logic.ts`, a client engine hook, the game component, `actions.ts` for the initial state)
2. Register the game in `src/registry.ts`
3. Add an entry to `games.manifest.json` (use `"active": false` until the game is ready)
4. Wire up `game-player.tsx`, exports, and competitive wrappers in `apps/web/lib/game/`
