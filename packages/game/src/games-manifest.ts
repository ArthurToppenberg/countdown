import gamesManifest from "../games.manifest.json";

export type GamesManifestEntry = {
  active: boolean;
};

export type GamesManifest = {
  games: Record<string, GamesManifestEntry>;
};

const parsedManifest = gamesManifest as GamesManifest;

const assertGamesManifestShape = (manifest: GamesManifest): void => {
  if (!manifest.games || typeof manifest.games !== "object") {
    throw new Error('games.manifest.json must have a "games" object');
  }

  for (const [gameId, entry] of Object.entries(manifest.games)) {
    if (typeof entry.active !== "boolean") {
      throw new Error(
        `games.manifest.json entry "${gameId}" must have a boolean "active" field`,
      );
    }
  }
};

export const assertManifestCoversRegisteredGames = (
  registeredGameIds: readonly string[],
): void => {
  assertGamesManifestShape(parsedManifest);

  const manifestIds = new Set(Object.keys(parsedManifest.games));
  const registeredIds = new Set(registeredGameIds);

  for (const gameId of manifestIds) {
    if (!registeredIds.has(gameId)) {
      throw new Error(
        `games.manifest.json references unknown game "${gameId}"`,
      );
    }
  }

  for (const gameId of registeredIds) {
    if (!manifestIds.has(gameId)) {
      throw new Error(
        `games.manifest.json is missing entry for registered game "${gameId}"`,
      );
    }
  }
};

export const isGameActive = (gameId: string): boolean => {
  const entry = parsedManifest.games[gameId];

  if (!entry) {
    return false;
  }

  return entry.active;
};

export const listActiveGameIds = (
  registeredGameIds: readonly string[],
): string[] =>
  registeredGameIds.filter((gameId) => isGameActive(gameId));
