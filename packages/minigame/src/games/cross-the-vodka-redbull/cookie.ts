import type { MinigamePlayMode } from "../../types";
import {
  CROSS_THE_VODKA_REDBULL_COMPETITIVE_COOKIE,
  CROSS_THE_VODKA_REDBULL_PRACTICE_COOKIE,
} from "./types";

export const getCrossTheVodkaRedbullCookieName = (
  mode: MinigamePlayMode,
): string =>
  mode === "competitive"
    ? CROSS_THE_VODKA_REDBULL_COMPETITIVE_COOKIE
    : CROSS_THE_VODKA_REDBULL_PRACTICE_COOKIE;
