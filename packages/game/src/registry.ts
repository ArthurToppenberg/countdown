import "server-only";

import {
  getTowerStackState,
  TOWER_STACK_ID,
  towerStack,
} from "./games/tower-stack";
import {
  assertManifestCoversRegisteredGames,
  isGameActive,
  listActiveGameIds,
} from "./games-manifest";
import type { GamePlayMode } from "./types";

export type GameRegistryEntry = {
  id: string;
  title: string;
  getInitialState: (mode?: GamePlayMode) => Promise<unknown>;
};

const gameRegistry: Record<string, GameRegistryEntry> = {
  [TOWER_STACK_ID]: {
    id: TOWER_STACK_ID,
    title: towerStack.title,
    getInitialState: () => getTowerStackState(),
  },
};

const registeredGameIds = Object.keys(gameRegistry);

assertManifestCoversRegisteredGames(registeredGameIds);

export const getRegisteredGame = (
  id: string,
): GameRegistryEntry | undefined => gameRegistry[id];

export const listRegisteredGames = (): GameRegistryEntry[] =>
  Object.values(gameRegistry);

export const getGame = (id: string): GameRegistryEntry | undefined => {
  const game = getRegisteredGame(id);

  if (!game || !isGameActive(id)) {
    return undefined;
  }

  return game;
};

export const listGames = (): GameRegistryEntry[] =>
  listRegisteredGames().filter((game) => isGameActive(game.id));

export const gameIds = (): string[] => listActiveGameIds(registeredGameIds);

export const registeredGameIdsList = (): string[] => registeredGameIds;

export type GameManifestStatus = {
  id: string;
  title: string;
  active: boolean;
};

export const listRegisteredGamesWithStatus = (): GameManifestStatus[] =>
  listRegisteredGames().map((game) => ({
    id: game.id,
    title: game.title,
    active: isGameActive(game.id),
  }));
