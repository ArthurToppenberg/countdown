import {
  TOWER_STACK_BLOCK_HEIGHT,
  TOWER_STACK_BOARD_WIDTH,
  TOWER_STACK_FALL_SPEED,
  TOWER_STACK_FIRST_BLOCK_WIDTH,
  TOWER_STACK_FOUNDATION_HEIGHT,
  TOWER_STACK_INITIAL_SPEED,
  TOWER_STACK_MAX_ATTEMPTS,
  TOWER_STACK_MIN_OVERLAP_RATIO,
  TOWER_STACK_SPAWN_Y,
  TOWER_STACK_SPEED_INCREASE,
  type TowerStackBlock,
  type TowerStackPublicState,
  type TowerStackSession,
} from "./types";

export const getFoundationBlock = (): TowerStackBlock => ({
  center: TOWER_STACK_BOARD_WIDTH / 2,
  width: TOWER_STACK_FIRST_BLOCK_WIDTH,
});

export const getPlacementTarget = (
  stack: TowerStackBlock[],
): TowerStackBlock => stack[stack.length - 1] ?? getFoundationBlock();

export const getBlockBounds = (
  blockWidth: number,
): { min: number; max: number } => {
  const half = blockWidth / 2;

  return {
    min: half,
    max: TOWER_STACK_BOARD_WIDTH - half,
  };
};

export const getOscillatingCenter = (
  blockWidth: number,
  phaseOffset: number,
  anchorAt: number,
  speed: number,
  now: number,
): number => {
  const { min, max } = getBlockBounds(blockWidth);
  const range = max - min;

  if (range <= 0) {
    return TOWER_STACK_BOARD_WIDTH / 2;
  }

  const totalTravel = phaseOffset + (now - anchorAt) * speed;
  const mod = ((totalTravel % (2 * range)) + 2 * range) % (2 * range);

  return mod <= range ? min + mod : max - (mod - range);
};

export const getCurrentPhaseOffset = (
  blockWidth: number,
  phaseOffset: number,
  anchorAt: number,
  speed: number,
  now: number,
): number => {
  const { min, max } = getBlockBounds(blockWidth);
  const range = max - min;

  if (range <= 0) {
    return 0;
  }

  const totalTravel = phaseOffset + (now - anchorAt) * speed;

  return ((totalTravel % (2 * range)) + 2 * range) % (2 * range);
};

export const getStackTopY = (stackLength: number): number =>
  TOWER_STACK_FOUNDATION_HEIGHT + stackLength * TOWER_STACK_BLOCK_HEIGHT;

export const getFallTargetCenterY = (stackLength: number): number =>
  getStackTopY(stackLength) + TOWER_STACK_BLOCK_HEIGHT / 2;

export const getFallDistance = (stackLength: number): number =>
  TOWER_STACK_SPAWN_Y - getFallTargetCenterY(stackLength);

export const getFallDuration = (stackLength: number): number =>
  getFallDistance(stackLength) / TOWER_STACK_FALL_SPEED;

export const getFallingBlockCenterY = (
  stackLength: number,
  fallStartedAt: number,
  now: number,
): number => {
  const targetY = getFallTargetCenterY(stackLength);
  const elapsed = (now - fallStartedAt) * TOWER_STACK_FALL_SPEED;

  return Math.max(targetY, TOWER_STACK_SPAWN_Y - elapsed);
};

export const isFallComplete = (
  stackLength: number,
  fallStartedAt: number,
  now: number,
): boolean => {
  const elapsed = (now - fallStartedAt) * TOWER_STACK_FALL_SPEED;

  return elapsed >= getFallDistance(stackLength);
};

export const createDefaultSession = (): TowerStackSession => ({
  attemptsRemaining: TOWER_STACK_MAX_ATTEMPTS,
  totalScore: 0,
  attemptScore: 0,
  phase: "ready",
  stack: [],
  blockWidth: TOWER_STACK_FIRST_BLOCK_WIDTH,
  blockPhase: "moving",
  lockedCenter: null,
  fallStartedAt: null,
  anchorAt: 0,
  phaseOffset: 0,
  speed: TOWER_STACK_INITIAL_SPEED,
  lastDropMissed: false,
});

export const startAttempt = (
  session: TowerStackSession,
  now: number,
): TowerStackSession => ({
  ...session,
  phase: "playing",
  stack: [],
  attemptScore: 0,
  blockWidth: TOWER_STACK_FIRST_BLOCK_WIDTH,
  blockPhase: "moving",
  lockedCenter: null,
  fallStartedAt: null,
  anchorAt: now,
  phaseOffset: 0,
  speed: TOWER_STACK_INITIAL_SPEED,
  lastDropMissed: false,
});

type PlacementResult =
  | { success: true; block: TowerStackBlock }
  | { success: false };

export const evaluatePlacement = (
  droppedCenter: number,
  droppedWidth: number,
  below: TowerStackBlock,
): PlacementResult => {
  const droppedLeft = droppedCenter - droppedWidth / 2;
  const droppedRight = droppedCenter + droppedWidth / 2;
  const belowLeft = below.center - below.width / 2;
  const belowRight = below.center + below.width / 2;
  const overlapLeft = Math.max(droppedLeft, belowLeft);
  const overlapRight = Math.min(droppedRight, belowRight);
  const overlapWidth = overlapRight - overlapLeft;
  const minOverlap = droppedWidth * TOWER_STACK_MIN_OVERLAP_RATIO;

  if (overlapWidth < minOverlap) {
    return { success: false };
  }

  return {
    success: true,
    block: {
      center: (overlapLeft + overlapRight) / 2,
      width: overlapWidth,
    },
  };
};

export const lockBlock = (
  session: TowerStackSession,
  now: number,
): TowerStackSession => ({
  ...session,
  blockPhase: "falling",
  lockedCenter: getOscillatingCenter(
    session.blockWidth,
    session.phaseOffset,
    session.anchorAt,
    session.speed,
    now,
  ),
  fallStartedAt: now,
});

export const finishAttemptAfterMiss = (
  session: TowerStackSession,
): TowerStackSession => {
  const attemptsRemaining = session.attemptsRemaining - 1;

  if (attemptsRemaining <= 0) {
    return {
      ...session,
      attemptsRemaining: 0,
      phase: "ended",
      stack: [],
      blockPhase: "moving",
      lockedCenter: null,
      fallStartedAt: null,
      lastDropMissed: true,
    };
  }

  return {
    ...session,
    attemptsRemaining,
    phase: "ready",
    stack: [],
    blockPhase: "moving",
    lockedCenter: null,
    fallStartedAt: null,
    lastDropMissed: true,
  };
};

export const applySuccessfulDrop = (
  session: TowerStackSession,
  block: TowerStackBlock,
  now: number,
): TowerStackSession => {
  const nextStack = [...session.stack, block];
  const nextSpeed = session.speed * TOWER_STACK_SPEED_INCREASE;
  const nextPhaseOffset = getCurrentPhaseOffset(
    block.width,
    session.phaseOffset,
    session.anchorAt,
    session.speed,
    session.fallStartedAt ?? now,
  );

  return {
    ...session,
    stack: nextStack,
    attemptScore: session.attemptScore + 1,
    totalScore: session.totalScore + 1,
    blockWidth: block.width,
    blockPhase: "moving",
    lockedCenter: null,
    fallStartedAt: null,
    anchorAt: now,
    phaseOffset: nextPhaseOffset,
    speed: nextSpeed,
    lastDropMissed: false,
  };
};

const getBlockCenterY = (
  session: TowerStackSession,
  now: number,
): number => {
  if (session.phase !== "playing") {
    return TOWER_STACK_SPAWN_Y;
  }

  if (
    session.blockPhase === "falling" &&
    session.fallStartedAt !== null
  ) {
    return getFallingBlockCenterY(
      session.stack.length,
      session.fallStartedAt,
      now,
    );
  }

  return TOWER_STACK_SPAWN_Y;
};

const getBlockCenterX = (
  session: TowerStackSession,
  now: number,
): number => {
  if (session.phase !== "playing") {
    return TOWER_STACK_BOARD_WIDTH / 2;
  }

  if (session.blockPhase === "falling" && session.lockedCenter !== null) {
    return session.lockedCenter;
  }

  return getOscillatingCenter(
    session.blockWidth,
    session.phaseOffset,
    session.anchorAt,
    session.speed,
    now,
  );
};

export const toPublicState = (
  session: TowerStackSession,
  now: number,
): TowerStackPublicState => ({
  attemptsRemaining: session.attemptsRemaining,
  totalScore: session.totalScore,
  attemptScore: session.attemptScore,
  phase: session.phase,
  stack: session.stack,
  blockWidth: session.blockWidth,
  blockCenter: getBlockCenterX(session, now),
  blockCenterY: getBlockCenterY(session, now),
  blockPhase: session.blockPhase,
  lockedCenter: session.lockedCenter,
  fallStartedAt: session.fallStartedAt,
  anchorAt: session.anchorAt,
  phaseOffset: session.phaseOffset,
  speed: session.speed,
  lastDropMissed: session.lastDropMissed,
});
