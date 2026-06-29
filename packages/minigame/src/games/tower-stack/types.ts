export const TOWER_STACK_PRACTICE_COOKIE = "minigame-tower-stack" as const;

export const TOWER_STACK_COMPETITIVE_COOKIE =
  "minigame-tower-stack-competitive" as const;

export const TOWER_STACK_MAX_ATTEMPTS = 3;
export const TOWER_STACK_BOARD_WIDTH = 100;
export const TOWER_STACK_FIRST_BLOCK_WIDTH = TOWER_STACK_BOARD_WIDTH * 0.8;
export const TOWER_STACK_BOARD_HEIGHT = 100;
export const TOWER_STACK_BLOCK_HEIGHT = 8;
export const TOWER_STACK_FOUNDATION_HEIGHT = 8;
export const TOWER_STACK_SPAWN_Y =
  TOWER_STACK_BOARD_HEIGHT - TOWER_STACK_BLOCK_HEIGHT / 2 - 4;
export const TOWER_STACK_INITIAL_SPEED = 0.055;
export const TOWER_STACK_FALL_SPEED = 0.1;
export const TOWER_STACK_SPEED_INCREASE = 1.06;
export const TOWER_STACK_MIN_OVERLAP_RATIO = 0.22;
export const TOWER_STACK_VIEWPORT_HEIGHT = TOWER_STACK_BOARD_HEIGHT * 0.92;
export const TOWER_STACK_CAMERA_FOCUS_PADDING = 14;
export const TOWER_STACK_CAMERA_LERP_RATE = 0.004;
export const TOWER_STACK_CAMERA_BASE_DRIFT = 0.000018;
export const TOWER_STACK_CAMERA_DRIFT_PER_BLOCK = 0.0000025;

export type TowerStackPhase = "ready" | "playing" | "ended";

export type TowerStackFailureReason = "miss" | "collapse";

export type TowerStackBlockPhase = "moving" | "falling";

export type TowerStackBlock = {
  center: number;
  width: number;
};

export type TowerStackPublicState = {
  attemptsRemaining: number;
  totalScore: number;
  attemptScore: number;
  phase: TowerStackPhase;
  stack: TowerStackBlock[];
  stackBaseIndex: number;
  blockWidth: number;
  blockCenter: number;
  blockCenterY: number;
  blockPhase: TowerStackBlockPhase;
  lockedCenter: number | null;
  fallStartedAt: number | null;
  anchorAt: number;
  phaseOffset: number;
  speed: number;
  cameraY: number;
  lastDropMissed: boolean;
  lastFailureReason: TowerStackFailureReason | null;
};

export type TowerStackSession = {
  attemptsRemaining: number;
  totalScore: number;
  attemptScore: number;
  phase: TowerStackPhase;
  stack: TowerStackBlock[];
  stackBaseIndex: number;
  blockWidth: number;
  blockPhase: TowerStackBlockPhase;
  lockedCenter: number | null;
  fallStartedAt: number | null;
  anchorAt: number;
  phaseOffset: number;
  speed: number;
  cameraY: number;
  cameraUpdatedAt: number;
  lastDropMissed: boolean;
  lastFailureReason: TowerStackFailureReason | null;
};

export type TowerStackActionResult =
  | { success: true; state: TowerStackPublicState }
  | { success: false; error: string; state: TowerStackPublicState };

export type TowerStackActions = {
  dropBlock: () => Promise<TowerStackActionResult>;
  settleBlock: () => Promise<TowerStackActionResult>;
  tick: () => Promise<TowerStackActionResult>;
  reset: () => Promise<TowerStackActionResult>;
};
