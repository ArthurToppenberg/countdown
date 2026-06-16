import {
  CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE,
  CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS,
  CROSS_THE_VODKA_REDBULL_TOTAL_LANES,
  type CrossTheVodkaRedbullPhase,
  type CrossTheVodkaRedbullPublicState,
  type CrossTheVodkaRedbullSession,
} from "./types";

export const getMultiplier = (lane: number): number => {
  if (lane <= 0) {
    return 0;
  }

  return Number((1.2 * lane).toFixed(2));
};

export const getCrashProbability = (lane: number): number =>
  0.05 + lane * 0.04;

export const generateCrashMap = (): boolean[] => {
  const crashMap = Array.from(
    { length: CROSS_THE_VODKA_REDBULL_TOTAL_LANES + 1 },
    () => false,
  );

  for (let lane = 1; lane <= CROSS_THE_VODKA_REDBULL_TOTAL_LANES; lane += 1) {
    crashMap[lane] = Math.random() < getCrashProbability(lane);
  }

  return crashMap;
};

export const createDefaultSession = (): CrossTheVodkaRedbullSession => ({
  attemptsRemaining: CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS,
  bankroll: 0,
  bet: 0,
  lane: 0,
  multiplier: 0,
  phase: "ready",
  crashMap: [],
});

export const startAttempt = (
  session: CrossTheVodkaRedbullSession,
): CrossTheVodkaRedbullSession => ({
  ...session,
  bet: CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE,
  lane: 0,
  multiplier: 0,
  phase: "playing",
  crashMap: generateCrashMap(),
});

export const finishAttempt = (
  session: CrossTheVodkaRedbullSession,
  payout: number,
): CrossTheVodkaRedbullSession => {
  const attemptsRemaining = session.attemptsRemaining - 1;
  const bankroll = session.bankroll + payout;

  if (attemptsRemaining <= 0) {
    return {
      ...session,
      attemptsRemaining: 0,
      bankroll,
      bet: 0,
      lane: 0,
      multiplier: 0,
      phase: "ended",
      crashMap: [],
    };
  }

  return {
    ...session,
    attemptsRemaining,
    bankroll,
    bet: 0,
    lane: 0,
    multiplier: 0,
    phase: "ready",
    crashMap: [],
  };
};

export const toPublicState = (
  session: CrossTheVodkaRedbullSession,
  options?: {
    message?: string;
    messageTone?: CrossTheVodkaRedbullPublicState["messageTone"];
    crashLane?: number | null;
  },
): CrossTheVodkaRedbullPublicState => ({
  attemptsRemaining: session.attemptsRemaining,
  bankroll: session.bankroll,
  bet: session.phase === "playing" ? session.bet : null,
  lane: session.lane,
  multiplier: session.multiplier,
  phase: session.phase,
  message: options?.message ?? "",
  messageTone: options?.messageTone ?? "default",
  crashLane: options?.crashLane ?? null,
});

export const formatCredits = (value: number): string =>
  new Intl.NumberFormat("da-DK").format(Math.round(value));

export const isPlayingPhase = (phase: CrossTheVodkaRedbullPhase): boolean =>
  phase === "playing";
