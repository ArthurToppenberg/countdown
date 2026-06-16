"use client";

import { CrossTheVodkaRedbullGame } from "./games/cross-the-vodka-redbull/cross-the-vodka-redbull-game";
import { CROSS_THE_VODKA_REDBULL_ID } from "./games/cross-the-vodka-redbull/cross-the-vodka-redbull-metadata";
import type { CrossTheVodkaRedbullActions } from "./games/cross-the-vodka-redbull/types";
import type { MinigamePlayMode } from "./types";

type MinigamePlayerProps = {
  gameId: string;
  initialState: unknown;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: CrossTheVodkaRedbullActions;
};

export const MinigamePlayer = ({
  gameId,
  initialState,
  variant = "standalone",
  mode = "practice",
  actions,
}: MinigamePlayerProps) => {
  if (gameId === CROSS_THE_VODKA_REDBULL_ID) {
    return (
      <CrossTheVodkaRedbullGame
        actions={actions}
        initialState={initialState as Parameters<
          typeof CrossTheVodkaRedbullGame
        >[0]["initialState"]}
        mode={mode}
        variant={variant}
      />
    );
  }

  return null;
};
