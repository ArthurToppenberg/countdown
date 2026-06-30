import {
  TOWER_STACK_BLOCK_HEIGHT,
  TOWER_STACK_BOARD_WIDTH,
  TOWER_STACK_CAMERA_BASE_DRIFT,
  TOWER_STACK_CAMERA_DRIFT_PER_BLOCK,
  TOWER_STACK_CAMERA_LERP_RATE,
  TOWER_STACK_CAMERA_MAX_STEP_MS,
  TOWER_STACK_CAMERA_TOP_FRACTION,
  TOWER_STACK_CULL_MARGIN,
  TOWER_STACK_FALL_SPEED,
  TOWER_STACK_FIRST_BLOCK_WIDTH,
  TOWER_STACK_FOUNDATION_HEIGHT,
  TOWER_STACK_INITIAL_SPEED,
  TOWER_STACK_MAX_ATTEMPTS,
  TOWER_STACK_MIN_OVERLAP_RATIO,
  TOWER_STACK_SPAWN_GAP,
  TOWER_STACK_SPEED_INCREASE,
  TOWER_STACK_VIEWPORT_HEIGHT,
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

export const getStackBlockCenterY = (
  stackBaseIndex: number,
  arrayIndex: number,
): number =>
  TOWER_STACK_FOUNDATION_HEIGHT +
  (stackBaseIndex + arrayIndex) * TOWER_STACK_BLOCK_HEIGHT +
  TOWER_STACK_BLOCK_HEIGHT / 2;

export const getStackTopY = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  TOWER_STACK_FOUNDATION_HEIGHT +
  (stackBaseIndex + stackLength) * TOWER_STACK_BLOCK_HEIGHT;

export const getSpawnCenterY = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  getStackTopY(stackBaseIndex, stackLength) + TOWER_STACK_SPAWN_GAP;

export const getFallTargetCenterY = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  getStackTopY(stackBaseIndex, stackLength) + TOWER_STACK_BLOCK_HEIGHT / 2;

export const getFallDistance = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  getSpawnCenterY(stackBaseIndex, stackLength) -
  getFallTargetCenterY(stackBaseIndex, stackLength);

export const getFallDuration = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  getFallDistance(stackBaseIndex, stackLength) / TOWER_STACK_FALL_SPEED;

export const getFallingBlockCenterY = (
  stackBaseIndex: number,
  stackLength: number,
  fallStartedAt: number,
  now: number,
): number => {
  const targetY = getFallTargetCenterY(stackBaseIndex, stackLength);
  const spawnY = getSpawnCenterY(stackBaseIndex, stackLength);
  const elapsed = (now - fallStartedAt) * TOWER_STACK_FALL_SPEED;

  return Math.max(targetY, spawnY - elapsed);
};

export const isFallComplete = (
  stackBaseIndex: number,
  stackLength: number,
  fallStartedAt: number,
  now: number,
): boolean => {
  const elapsed = (now - fallStartedAt) * TOWER_STACK_FALL_SPEED;

  return elapsed >= getFallDistance(stackBaseIndex, stackLength);
};

export const getCameraTargetY = (
  stackBaseIndex: number,
  stackLength: number,
): number =>
  getStackTopY(stackBaseIndex, stackLength) +
  TOWER_STACK_VIEWPORT_HEIGHT * (0.5 - TOWER_STACK_CAMERA_TOP_FRACTION);

export const getInitialCameraY = (): number => getCameraTargetY(0, 0);

export const getKillZoneLimit = (cameraY: number): number =>
  cameraY - TOWER_STACK_VIEWPORT_HEIGHT / 2;

export const advanceCameraY = (
  currentY: number,
  targetY: number,
  stackLength: number,
  elapsedMs: number,
): number => {
  const step = Math.min(elapsedMs, TOWER_STACK_CAMERA_MAX_STEP_MS);
  const lerpFactor = 1 - Math.exp(-TOWER_STACK_CAMERA_LERP_RATE * step);
  const followedY = currentY + (targetY - currentY) * lerpFactor;
  const driftRate =
    TOWER_STACK_CAMERA_BASE_DRIFT +
    stackLength * TOWER_STACK_CAMERA_DRIFT_PER_BLOCK;
  const driftedY = currentY + driftRate * step;

  return Math.max(getInitialCameraY(), followedY, driftedY);
};

export const isPlacementSurfaceConsumed = (
  stackBaseIndex: number,
  stackLength: number,
  yLimit: number,
): boolean => getStackTopY(stackBaseIndex, stackLength) < yLimit;

export const cullStackByKillZone = (
  stack: TowerStackBlock[],
  stackBaseIndex: number,
  yLimit: number,
): { stack: TowerStackBlock[]; stackBaseIndex: number } => {
  const culledStack = [...stack];
  let nextBaseIndex = stackBaseIndex;

  while (culledStack.length > 0) {
    const bottomY =
      getStackBlockCenterY(nextBaseIndex, 0) - TOWER_STACK_BLOCK_HEIGHT / 2;

    if (bottomY >= yLimit) {
      break;
    }

    culledStack.shift();
    nextBaseIndex += 1;
  }

  return {
    stack: culledStack,
    stackBaseIndex: nextBaseIndex,
  };
};

export const createDefaultSession = (): TowerStackSession => ({
  attemptsRemaining: TOWER_STACK_MAX_ATTEMPTS,
  totalScore: 0,
  attemptScore: 0,
  phase: "ready",
  stack: [],
  stackBaseIndex: 0,
  blockWidth: TOWER_STACK_FIRST_BLOCK_WIDTH,
  blockPhase: "moving",
  lockedCenter: null,
  fallStartedAt: null,
  anchorAt: 0,
  phaseOffset: 0,
  speed: TOWER_STACK_INITIAL_SPEED,
  cameraY: getInitialCameraY(),
  cameraUpdatedAt: 0,
  lastDropMissed: false,
  lastFailureReason: null,
});

export const startAttempt = (
  session: TowerStackSession,
  now: number,
): TowerStackSession => ({
  ...session,
  phase: "playing",
  stack: [],
  stackBaseIndex: 0,
  attemptScore: 0,
  blockWidth: TOWER_STACK_FIRST_BLOCK_WIDTH,
  blockPhase: "moving",
  lockedCenter: null,
  fallStartedAt: null,
  anchorAt: now,
  phaseOffset: 0,
  speed: TOWER_STACK_INITIAL_SPEED,
  cameraY: getInitialCameraY(),
  cameraUpdatedAt: now,
  lastDropMissed: false,
  lastFailureReason: null,
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
      stackBaseIndex: 0,
      blockPhase: "moving",
      lockedCenter: null,
      fallStartedAt: null,
      cameraY: getInitialCameraY(),
      cameraUpdatedAt: 0,
      lastDropMissed: true,
      lastFailureReason: "miss",
    };
  }

  return {
    ...session,
    attemptsRemaining,
    phase: "ready",
    stack: [],
    stackBaseIndex: 0,
    blockPhase: "moving",
    lockedCenter: null,
    fallStartedAt: null,
    cameraY: getInitialCameraY(),
    cameraUpdatedAt: 0,
    lastDropMissed: true,
    lastFailureReason: "miss",
  };
};

export const finishAttemptAfterCollapse = (
  session: TowerStackSession,
): TowerStackSession => {
  const attemptsRemaining = session.attemptsRemaining - 1;

  if (attemptsRemaining <= 0) {
    return {
      ...session,
      attemptsRemaining: 0,
      phase: "ended",
      stack: [],
      stackBaseIndex: 0,
      blockPhase: "moving",
      lockedCenter: null,
      fallStartedAt: null,
      cameraY: getInitialCameraY(),
      cameraUpdatedAt: 0,
      lastDropMissed: true,
      lastFailureReason: "collapse",
    };
  }

  return {
    ...session,
    attemptsRemaining,
    phase: "ready",
    stack: [],
    stackBaseIndex: 0,
    blockPhase: "moving",
    lockedCenter: null,
    fallStartedAt: null,
    cameraY: getInitialCameraY(),
    cameraUpdatedAt: 0,
    lastDropMissed: true,
    lastFailureReason: "collapse",
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
    lastFailureReason: null,
  };
};

export const settleBlock = (
  session: TowerStackSession,
  now: number,
): TowerStackSession => {
  if (session.phase !== "playing" || session.blockPhase !== "falling") {
    return session;
  }

  if (session.lockedCenter === null || session.fallStartedAt === null) {
    return session;
  }

  if (
    !isFallComplete(
      session.stackBaseIndex,
      session.stack.length,
      session.fallStartedAt,
      now,
    )
  ) {
    return session;
  }

  const placement = evaluatePlacement(
    session.lockedCenter,
    session.blockWidth,
    getPlacementTarget(session.stack),
  );

  if (!placement.success) {
    return finishAttemptAfterMiss(session);
  }

  return applySuccessfulDrop(session, placement.block, now);
};

export const advanceTowerStackWorld = (
  session: TowerStackSession,
  now: number,
): TowerStackSession => {
  if (session.phase !== "playing") {
    return session;
  }

  const elapsed = now - session.cameraUpdatedAt;

  if (elapsed <= 0) {
    return session;
  }

  const targetY = getCameraTargetY(session.stackBaseIndex, session.stack.length);
  const cameraY = advanceCameraY(
    session.cameraY,
    targetY,
    session.stack.length,
    elapsed,
  );
  const yLimit = getKillZoneLimit(cameraY);
  const culled = cullStackByKillZone(
    session.stack,
    session.stackBaseIndex,
    yLimit - TOWER_STACK_CULL_MARGIN,
  );

  const wholeStackConsumed =
    culled.stack.length === 0 && culled.stackBaseIndex > 0;

  if (
    wholeStackConsumed ||
    isPlacementSurfaceConsumed(
      culled.stackBaseIndex,
      culled.stack.length,
      yLimit,
    )
  ) {
    return finishAttemptAfterCollapse({
      ...session,
      ...culled,
      cameraY,
      cameraUpdatedAt: now,
    });
  }

  return {
    ...session,
    ...culled,
    cameraY,
    cameraUpdatedAt: now,
  };
};

const getBlockCenterY = (
  session: TowerStackSession,
  now: number,
): number => {
  const spawnY = getSpawnCenterY(session.stackBaseIndex, session.stack.length);

  if (session.phase !== "playing") {
    return spawnY;
  }

  if (
    session.blockPhase === "falling" &&
    session.fallStartedAt !== null
  ) {
    return getFallingBlockCenterY(
      session.stackBaseIndex,
      session.stack.length,
      session.fallStartedAt,
      now,
    );
  }

  return spawnY;
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
  stackBaseIndex: session.stackBaseIndex,
  blockWidth: session.blockWidth,
  blockCenter: getBlockCenterX(session, now),
  blockCenterY: getBlockCenterY(session, now),
  blockPhase: session.blockPhase,
  lockedCenter: session.lockedCenter,
  fallStartedAt: session.fallStartedAt,
  anchorAt: session.anchorAt,
  phaseOffset: session.phaseOffset,
  speed: session.speed,
  cameraY: session.cameraY,
  lastDropMissed: session.lastDropMissed,
  lastFailureReason: session.lastFailureReason,
});
