"use server";

import type { MinigamePlayMode } from "../../types";
import {
  clearGameSession,
  readGameSession,
  signGameSession,
} from "../../session/game-session";
import { getTowerStackCookieName } from "./cookie";
import { TOWER_STACK_COPY } from "./copy";
import {
  applySuccessfulDrop,
  createDefaultSession,
  evaluatePlacement,
  finishAttemptAfterMiss,
  getPlacementTarget,
  isFallComplete,
  lockBlock,
  startAttempt,
  toPublicState,
} from "./logic";
import {
  type TowerStackActionResult,
  type TowerStackPublicState,
  type TowerStackSession,
} from "./types";

const readSession = async (
  mode: MinigamePlayMode,
): Promise<TowerStackSession> => {
  const cookieName = getTowerStackCookieName(mode);
  const session = await readGameSession<Record<string, unknown>>(cookieName);

  if (!session || !isValidSession(session)) {
    return createDefaultSession();
  }

  if (mode === "competitive" && session.phase === "ended") {
    return createDefaultSession();
  }

  return session;
};

const isValidStack = (stack: unknown[]): boolean =>
  stack.every(
    (block) =>
      typeof block === "object" &&
      block !== null &&
      typeof (block as { center?: unknown }).center === "number" &&
      Number.isFinite((block as { center: number }).center) &&
      typeof (block as { width?: unknown }).width === "number" &&
      Number.isFinite((block as { width: number }).width),
  );

const isValidSession = (
  value: Record<string, unknown>,
): value is TowerStackSession => {
  return (
    typeof value.attemptsRemaining === "number" &&
    Number.isFinite(value.attemptsRemaining) &&
    typeof value.totalScore === "number" &&
    Number.isFinite(value.totalScore) &&
    typeof value.attemptScore === "number" &&
    Number.isFinite(value.attemptScore) &&
    (value.phase === "ready" ||
      value.phase === "playing" ||
      value.phase === "ended") &&
    Array.isArray(value.stack) &&
    isValidStack(value.stack) &&
    typeof value.blockWidth === "number" &&
    Number.isFinite(value.blockWidth) &&
    (value.blockPhase === "moving" || value.blockPhase === "falling") &&
    (value.lockedCenter === null ||
      (typeof value.lockedCenter === "number" &&
        Number.isFinite(value.lockedCenter))) &&
    (value.fallStartedAt === null ||
      (typeof value.fallStartedAt === "number" &&
        Number.isFinite(value.fallStartedAt))) &&
    typeof value.anchorAt === "number" &&
    Number.isFinite(value.anchorAt) &&
    typeof value.phaseOffset === "number" &&
    Number.isFinite(value.phaseOffset) &&
    typeof value.speed === "number" &&
    Number.isFinite(value.speed) &&
    typeof value.lastDropMissed === "boolean"
  );
};

const persistSession = async (
  mode: MinigamePlayMode,
  session: TowerStackSession,
): Promise<void> => {
  const cookieName = getTowerStackCookieName(mode);
  await signGameSession(cookieName, session);
};

const success = (
  session: TowerStackSession,
  now: number,
): TowerStackActionResult => ({
  success: true,
  state: toPublicState(session, now),
});

const failure = (
  session: TowerStackSession,
  error: string,
  now: number,
): TowerStackActionResult => ({
  success: false,
  error,
  state: toPublicState(session, now),
});

export const getTowerStackState = async (
  mode: MinigamePlayMode = "practice",
): Promise<TowerStackPublicState> => {
  const session = await readSession(mode);
  return toPublicState(session, Date.now());
};

export const dropTowerStackBlock = async (
  mode: MinigamePlayMode = "practice",
): Promise<TowerStackActionResult> => {
  const now = Date.now();
  const session = await readSession(mode);

  if (session.phase === "ended") {
    return failure(session, TOWER_STACK_COPY.gameOverNoAttempts, now);
  }

  if (session.phase === "ready") {
    const nextSession = startAttempt(session, now);
    await persistSession(mode, nextSession);
    return success(nextSession, now);
  }

  if (session.phase !== "playing") {
    return failure(session, TOWER_STACK_COPY.cannotDropNow, now);
  }

  if (session.blockPhase === "falling") {
    return failure(session, TOWER_STACK_COPY.cannotDropNow, now);
  }

  const nextSession = lockBlock(session, now);
  await persistSession(mode, nextSession);
  return success(nextSession, now);
};

export const settleTowerStackBlock = async (
  mode: MinigamePlayMode = "practice",
): Promise<TowerStackActionResult> => {
  const now = Date.now();
  const session = await readSession(mode);

  if (session.phase !== "playing" || session.blockPhase !== "falling") {
    return failure(session, TOWER_STACK_COPY.cannotSettleNow, now);
  }

  if (session.lockedCenter === null || session.fallStartedAt === null) {
    return failure(session, TOWER_STACK_COPY.cannotSettleNow, now);
  }

  if (
    !isFallComplete(session.stack.length, session.fallStartedAt, now)
  ) {
    return failure(session, TOWER_STACK_COPY.fallNotComplete, now);
  }

  const placement = evaluatePlacement(
    session.lockedCenter,
    session.blockWidth,
    getPlacementTarget(session.stack),
  );

  if (!placement.success) {
    const finishedSession = finishAttemptAfterMiss(session);
    await persistSession(mode, finishedSession);
    return success(finishedSession, now);
  }

  const nextSession = applySuccessfulDrop(session, placement.block, now);
  await persistSession(mode, nextSession);
  return success(nextSession, now);
};

export const resetTowerStack = async (
  mode: MinigamePlayMode = "practice",
): Promise<TowerStackActionResult> => {
  const now = Date.now();
  const nextSession = createDefaultSession();
  await persistSession(mode, nextSession);
  return success(nextSession, now);
};

export const clearTowerStackSession = async (
  mode: MinigamePlayMode = "practice",
): Promise<void> => {
  const cookieName = getTowerStackCookieName(mode);
  await clearGameSession(cookieName);
};
