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

## Adding a new game

1. Create `src/games/your-game/` with:
   - `logic.ts` — pure game rules
   - `types.ts` — session + public state types
   - `actions.ts` — `"use server"` actions using `session/game-session.ts`
   - `your-game.tsx` — client React UI
2. Register the game in `src/registry.ts`

## Environment

Uses `JWT_SECRET` (same as auth) to sign game session cookies.
