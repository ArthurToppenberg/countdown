import "server-only";

import {
  CROSS_THE_VODKA_REDBULL_ID,
  crossTheVodkaRedbull,
  getCrossTheVodkaRedbullState,
} from "./games/cross-the-vodka-redbull";

export type MinigameRegistryEntry = {
  id: string;
  title: string;
  getInitialState: () => Promise<unknown>;
};

const minigameRegistry: Record<string, MinigameRegistryEntry> = {
  [CROSS_THE_VODKA_REDBULL_ID]: {
    id: CROSS_THE_VODKA_REDBULL_ID,
    title: crossTheVodkaRedbull.title,
    getInitialState: () => getCrossTheVodkaRedbullState(),
  },
};

export const FEATURED_MINIGAME_ID = CROSS_THE_VODKA_REDBULL_ID;

export const getFeaturedMinigame = (): MinigameRegistryEntry => {
  const game = minigameRegistry[FEATURED_MINIGAME_ID];

  if (!game) {
    throw new Error(`Featured minigame "${FEATURED_MINIGAME_ID}" is not registered`);
  }

  return game;
};

export const listMinigames = (): MinigameRegistryEntry[] =>
  Object.values(minigameRegistry);

export const getMinigame = (id: string): MinigameRegistryEntry | undefined =>
  minigameRegistry[id];

export const minigameIds = (): string[] => Object.keys(minigameRegistry);
