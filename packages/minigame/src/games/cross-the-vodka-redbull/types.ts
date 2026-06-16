export const CROSS_THE_VODKA_REDBULL_PRACTICE_COOKIE =
  "minigame-cross-the-vodka-redbull" as const;

export const CROSS_THE_VODKA_REDBULL_COMPETITIVE_COOKIE =
  "minigame-cross-the-vodka-redbull-competitive" as const;

export const CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS = 5;
export const CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE = 100;
export const CROSS_THE_VODKA_REDBULL_TOTAL_LANES = 10;

export type CrossTheVodkaRedbullPhase = "ready" | "playing" | "ended";

export type CrossTheVodkaRedbullMessageTone = "default" | "error" | "success";

export type CrossTheVodkaRedbullPublicState = {
  attemptsRemaining: number;
  bankroll: number;
  bet: number | null;
  lane: number;
  multiplier: number;
  phase: CrossTheVodkaRedbullPhase;
  message: string;
  messageTone: CrossTheVodkaRedbullMessageTone;
  crashLane: number | null;
};

export type CrossTheVodkaRedbullSession = {
  attemptsRemaining: number;
  bankroll: number;
  bet: number;
  lane: number;
  multiplier: number;
  phase: CrossTheVodkaRedbullPhase;
  crashMap: boolean[];
};

export type CrossTheVodkaRedbullActionResult =
  | { success: true; state: CrossTheVodkaRedbullPublicState }
  | { success: false; error: string; state: CrossTheVodkaRedbullPublicState };

export type CrossTheVodkaRedbullActions = {
  takeStep: () => Promise<CrossTheVodkaRedbullActionResult>;
  cashOut: () => Promise<CrossTheVodkaRedbullActionResult>;
  reset: () => Promise<CrossTheVodkaRedbullActionResult>;
};
