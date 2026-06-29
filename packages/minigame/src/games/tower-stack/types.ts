export const TOWER_STACK_MAX_ATTEMPTS = 3;
export const TOWER_STACK_BOARD_WIDTH = 100;
export const TOWER_STACK_FIRST_BLOCK_WIDTH = TOWER_STACK_BOARD_WIDTH * 0.8;
export const TOWER_STACK_BOARD_HEIGHT = 100;
export const TOWER_STACK_BLOCK_HEIGHT = 8;
export const TOWER_STACK_FOUNDATION_HEIGHT = 8;
export const TOWER_STACK_INITIAL_SPEED = 0.055;
export const TOWER_STACK_FALL_SPEED = 0.1;
export const TOWER_STACK_SPEED_INCREASE = 1.06;
export const TOWER_STACK_MIN_OVERLAP_RATIO = 0.22;
export const TOWER_STACK_VIEWPORT_HEIGHT = TOWER_STACK_BOARD_HEIGHT * 0.92;

// A new block always appears this many world units above the current tower top,
// so the fall distance stays constant no matter how tall the tower gets.
export const TOWER_STACK_SPAWN_GAP = 50;

// When the camera has settled, the tower top rests at this fraction of the
// viewport measured from the bottom, leaving headroom for the next block above.
export const TOWER_STACK_CAMERA_TOP_FRACTION = 0.3;

// Rate (per ms) at which the camera interpolates toward the tower top.
export const TOWER_STACK_CAMERA_LERP_RATE = 0.006;

// Baseline upward drift of the kill zone (per ms) plus the extra drift added for
// every placed block. Together they create the "keep a steady pace" pressure.
export const TOWER_STACK_CAMERA_BASE_DRIFT = 0.005;
export const TOWER_STACK_CAMERA_DRIFT_PER_BLOCK = 0.0007;

// Upper bound on the elapsed time applied in a single advance so a backgrounded
// tab (where ticks stop firing) cannot resume and instantly consume the tower.
export const TOWER_STACK_CAMERA_MAX_STEP_MS = 500;

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

// One locked block within an attempt. `lockedCenter` is the x-position at which
// the player stopped the oscillating block; `lockedAtMs` is the time since the
// attempt began. Together they form a deterministic input log that the server
// can replay through the shared pure logic to recompute the authoritative score.
export type TowerStackPlacementInput = {
  lockedCenter: number;
  lockedAtMs: number;
};

export type TowerStackAttemptReplay = {
  placements: TowerStackPlacementInput[];
};

export type TowerStackReplay = {
  attempts: TowerStackAttemptReplay[];
};

export type TowerStackResultPayload = {
  score: number;
  replay: TowerStackReplay;
};

export type TowerStackSubmitResult =
  | { success: true }
  | { success: false; error: string };

export type TowerStackActions = {
  submitResult: (payload: TowerStackResultPayload) => Promise<TowerStackSubmitResult>;
};
