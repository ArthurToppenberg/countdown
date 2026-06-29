import "server-only";

import {
  getTowerStackState,
  TOWER_STACK_ID,
  towerStack,
} from "./games/tower-stack";
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
  [TOWER_STACK_ID]: {
    id: TOWER_STACK_ID,
    title: towerStack.title,
    getInitialState: () => getTowerStackState(),
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

export type MinigameManifestStatus = {
  id: string;
  title: string;
  active: boolean;
};

export const listRegisteredMinigamesWithStatus = (): MinigameManifestStatus[] =>
  listRegisteredMinigames().map((game) => ({
    id: game.id,
    title: game.title,
    active: isMinigameActive(game.id),
  }));
