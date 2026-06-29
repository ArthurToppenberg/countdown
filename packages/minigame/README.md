# @countdown/minigame

Shared minigame definitions, server-side game logic, and React UI for Countdown.

## Architecture

- **React UI** — client components render the game board
- **Server actions** — all game state changes run on the server
- **Signed httpOnly cookie** — crash map, bankroll, and round state are stored server-side in a JWT cookie (no DB, no user data)

This prevents clients from tampering with crash outcomes or bankroll values.

## Usage

```tsx
import {
  CrossTheVodkaRedbullGame,
  getCrossTheVodkaRedbullState,
} from "@countdown/minigame/games/cross-the-vodka-redbull";

const initialState = await getCrossTheVodkaRedbullState();

return <CrossTheVodkaRedbullGame initialState={initialState} />;
```

## Playing games

Each game is playable at `/game/[game-id]` (for example `/game/cross-the-vodka-redbull`). Register new games in `src/registry.ts`.

## Activating games

`games.manifest.json` at the package root is the master list of games. Set `"active": true` to include a game in the daily rotation pool and public listings; set `"active": false` to hide it while keeping it playable at its direct URL for development.

Every game registered in `src/registry.ts` must have a matching entry in `games.manifest.json`. The app fails fast at startup if the manifest and registry are out of sync.

## Daily minigame selection

Each Copenhagen calendar day, one active game is picked deterministically and stored in the `DailyMinigame` database table. All players get the same game that day. Selection uses `minigameIds()` (active games only) and a salted date hash (`DAILY_MINIGAME_SALT` or `JWT_SECRET` in the web app).

## Adding a new game

1. Create `src/games/your-game/` with:
   - `logic.ts` — pure game rules
   - `types.ts` — session + public state types
   - `actions.ts` — `"use server"` actions using `session/game-session.ts`
   - `your-game.tsx` — client React UI
2. Register the game in `src/registry.ts`
3. Add an entry to `games.manifest.json` (use `"active": false` until the game is ready)

## Environment

Uses `JWT_SECRET` (same as auth) to sign game session cookies.
