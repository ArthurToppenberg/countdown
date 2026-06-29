"use client";

import { TowerStackGame } from "./games/tower-stack/tower-stack-game";
import { TOWER_STACK_ID } from "./games/tower-stack/tower-stack-metadata";
import type { TowerStackActions } from "./games/tower-stack/types";
import type { MinigamePlayMode } from "./types";

type MinigamePlayerProps = {
  gameId: string;
  initialState: unknown;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: TowerStackActions;
};

export const MinigamePlayer = ({
  gameId,
  initialState,
  variant = "standalone",
  mode = "practice",
  actions,
}: MinigamePlayerProps) => {
  if (gameId === TOWER_STACK_ID) {
    return (
      <TowerStackGame
        actions={actions as TowerStackActions | undefined}
        initialState={initialState as Parameters<
          typeof TowerStackGame
        >[0]["initialState"]}
        mode={mode}
        variant={variant}
      />
    );
  }

  return null;
};
