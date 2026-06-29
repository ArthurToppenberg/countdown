import type { MinigamePlayMode } from "../../types";
import {
  TOWER_STACK_COMPETITIVE_COOKIE,
  TOWER_STACK_PRACTICE_COOKIE,
} from "./types";

export const getTowerStackCookieName = (mode: MinigamePlayMode): string =>
  mode === "competitive"
    ? TOWER_STACK_COMPETITIVE_COOKIE
    : TOWER_STACK_PRACTICE_COOKIE;
