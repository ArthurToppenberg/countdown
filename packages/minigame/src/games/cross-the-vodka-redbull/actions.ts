"use server";

import type { MinigamePlayMode } from "../../types";
import {
  clearGameSession,
  readGameSession,
  signGameSession,
} from "../../session/game-session";
import { getCrossTheVodkaRedbullCookieName } from "./cookie";
import { CROSS_THE_VODKA_REDBULL_COPY } from "./copy";
import {
  createDefaultSession,
  finishAttempt,
  getMultiplier,
  startAttempt,
  toPublicState,
} from "./logic";
import {
  CROSS_THE_VODKA_REDBULL_TOTAL_LANES,
  type CrossTheVodkaRedbullActionResult,
  type CrossTheVodkaRedbullPublicState,
  type CrossTheVodkaRedbullSession,
} from "./types";

const readSession = async (
  mode: MinigamePlayMode,
): Promise<CrossTheVodkaRedbullSession> => {
  const cookieName = getCrossTheVodkaRedbullCookieName(mode);
  const session = await readGameSession<Record<string, unknown>>(cookieName);

  if (!session || !isValidSession(session)) {
    return createDefaultSession();
  }

  if (mode === "competitive" && session.phase === "ended") {
    return createDefaultSession();
  }

  return session;
};

const isValidCrashMap = (crashMap: unknown[]): boolean =>
  crashMap.length === 0 ||
  (crashMap.length === CROSS_THE_VODKA_REDBULL_TOTAL_LANES + 1 &&
    crashMap.every((entry) => typeof entry === "boolean"));

const isValidSession = (
  value: Record<string, unknown>,
): value is CrossTheVodkaRedbullSession => {
  return (
    typeof value.attemptsRemaining === "number" &&
    Number.isFinite(value.attemptsRemaining) &&
    typeof value.bankroll === "number" &&
    Number.isFinite(value.bankroll) &&
    typeof value.bet === "number" &&
    Number.isFinite(value.bet) &&
    typeof value.lane === "number" &&
    Number.isFinite(value.lane) &&
    typeof value.multiplier === "number" &&
    Number.isFinite(value.multiplier) &&
    (value.phase === "ready" ||
      value.phase === "playing" ||
      value.phase === "ended") &&
    Array.isArray(value.crashMap) &&
    isValidCrashMap(value.crashMap)
  );
};

const persistSession = async (
  mode: MinigamePlayMode,
  session: CrossTheVodkaRedbullSession,
): Promise<void> => {
  const cookieName = getCrossTheVodkaRedbullCookieName(mode);
  await signGameSession(cookieName, session);
};

const success = (
  session: CrossTheVodkaRedbullSession,
  options?: Parameters<typeof toPublicState>[1],
): CrossTheVodkaRedbullActionResult => ({
  success: true,
  state: toPublicState(session, options),
});

const failure = (
  session: CrossTheVodkaRedbullSession,
  error: string,
  options?: Parameters<typeof toPublicState>[1],
): CrossTheVodkaRedbullActionResult => ({
  success: false,
  error,
  state: toPublicState(session, options),
});

export const getCrossTheVodkaRedbullState = async (
  mode: MinigamePlayMode = "practice",
): Promise<CrossTheVodkaRedbullPublicState> => {
  const session = await readSession(mode);
  return toPublicState(session);
};

export const takeCrossTheVodkaRedbullStep = async (
  mode: MinigamePlayMode = "practice",
): Promise<CrossTheVodkaRedbullActionResult> => {
  const session = await readSession(mode);

  if (session.phase === "ended") {
    return failure(session, CROSS_THE_VODKA_REDBULL_COPY.gameOverNoAttempts);
  }

  const activeSession =
    session.phase === "ready" ? startAttempt(session) : session;

  if (activeSession.phase !== "playing") {
    return failure(session, CROSS_THE_VODKA_REDBULL_COPY.cannotStepNow);
  }

  const nextLane = activeSession.lane + 1;

  if (activeSession.crashMap[nextLane]) {
    const finishedSession = finishAttempt(activeSession, 0);
    await persistSession(mode, finishedSession);

    return success(finishedSession, {
      crashLane: nextLane,
    });
  }

  const multiplier = getMultiplier(nextLane);
  const nextSession: CrossTheVodkaRedbullSession = {
    ...activeSession,
    lane: nextLane,
    multiplier,
  };

  if (nextLane >= CROSS_THE_VODKA_REDBULL_TOTAL_LANES) {
    const payout = Math.round(nextSession.bet * multiplier);
    const finishedSession = finishAttempt(nextSession, payout);
    await persistSession(mode, finishedSession);

    return success(finishedSession);
  }

  await persistSession(mode, nextSession);

  return success(nextSession);
};

export const cashOutCrossTheVodkaRedbull = async (
  mode: MinigamePlayMode = "practice",
): Promise<CrossTheVodkaRedbullActionResult> => {
  const session = await readSession(mode);

  if (session.phase === "ended") {
    return failure(session, CROSS_THE_VODKA_REDBULL_COPY.gameOverNoAttempts);
  }

  if (session.phase !== "playing") {
    return failure(session, CROSS_THE_VODKA_REDBULL_COPY.takeStepBeforeCashOut);
  }

  if (session.lane <= 0) {
    return failure(
      session,
      CROSS_THE_VODKA_REDBULL_COPY.takeOneStepBeforeCashOut,
    );
  }

  const payout = Math.round(session.bet * session.multiplier);
  const finishedSession = finishAttempt(session, payout);
  await persistSession(mode, finishedSession);

  return success(finishedSession);
};

export const resetCrossTheVodkaRedbull = async (
  mode: MinigamePlayMode = "practice",
): Promise<CrossTheVodkaRedbullActionResult> => {
  const nextSession = createDefaultSession();
  await persistSession(mode, nextSession);

  return success(nextSession);
};

export const clearCrossTheVodkaRedbullSession = async (
  mode: MinigamePlayMode = "practice",
): Promise<void> => {
  const cookieName = getCrossTheVodkaRedbullCookieName(mode);
  await clearGameSession(cookieName);
};
