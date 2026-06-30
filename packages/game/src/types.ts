export const GAME_TYPES = ["TEST", "POINT"] as const;

export type GameType = (typeof GAME_TYPES)[number];

export type GameResult = Record<string, unknown>;

export const GAME_PLAY_MODES = ["practice", "competitive"] as const;

export type GamePlayMode = (typeof GAME_PLAY_MODES)[number];
