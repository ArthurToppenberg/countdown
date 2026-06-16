export const MINIGAME_TYPES = ["TEST", "POINT"] as const;

export type MinigameType = (typeof MINIGAME_TYPES)[number];

export type MinigameResult = Record<string, unknown>;

export const MINIGAME_PLAY_MODES = ["practice", "competitive"] as const;

export type MinigamePlayMode = (typeof MINIGAME_PLAY_MODES)[number];
