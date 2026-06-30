"use server";

import { createDefaultSession, toPublicState } from "./logic";
import { type TowerStackPublicState } from "./types";

// The game is simulated entirely on the client (see use-tower-stack-engine.ts),
// so the server only needs to hand the client a fresh starting state. Results
// are submitted once at the end of the game via the per-mode submit action.
export const getTowerStackState =
  async (): Promise<TowerStackPublicState> => {
    return toPublicState(createDefaultSession(), Date.now());
  };
