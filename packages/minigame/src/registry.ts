import "server-only";

import {
  CROSS_THE_VODKA_REDBULL_ID,
  crossTheVodkaRedbull,
  getCrossTheVodkaRedbullState,
} from "./games/cross-the-vodka-redbull";
import {
  assertManifestCoversRegisteredGames,
  isMinigameActive,
  listActiveMinigameIds,
} from "./games-manifest";
import type { MinigamePlayMode } from "./types";

export type MinigameRegistryEntry = {
  id: string;
  title: string;
  getInitialState: (mode?: MinigamePlayMode) => Promise<unknown>;
};

const minigameRegistry: Record<string, MinigameRegistryEntry> = {
  [CROSS_THE_VODKA_REDBULL_ID]: {
    id: CROSS_THE_VODKA_REDBULL_ID,
    title: crossTheVodkaRedbull.title,
    getInitialState: (mode = "practice") => getCrossTheVodkaRedbullState(mode),
  },
};

const registeredMinigameIds = Object.keys(minigameRegistry);

assertManifestCoversRegisteredGames(registeredMinigameIds);

export const getRegisteredMinigame = (
  id: string,
): MinigameRegistryEntry | undefined => minigameRegistry[id];

export const listRegisteredMinigames = (): MinigameRegistryEntry[] =>
  Object.values(minigameRegistry);

export const getMinigame = (id: string): MinigameRegistryEntry | undefined => {
  const game = getRegisteredMinigame(id);

  if (!game || !isMinigameActive(id)) {
    return undefined;
  }

  return game;
};

export const listMinigames = (): MinigameRegistryEntry[] =>
  listRegisteredMinigames().filter((game) => isMinigameActive(game.id));

export const minigameIds = (): string[] => listActiveMinigameIds(registeredMinigameIds);

export const registeredMinigameIdsList = (): string[] => registeredMinigameIds;
