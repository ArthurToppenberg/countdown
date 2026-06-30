"use client";

import { TowerStackGame } from "./games/tower-stack/tower-stack-game";
import { TOWER_STACK_ID } from "./games/tower-stack/tower-stack-metadata";
import type { TowerStackActions } from "./games/tower-stack/types";
import type { GamePlayMode } from "./types";

type GamePlayerProps = {
  gameId: string;
  initialState: unknown;
  variant?: "standalone" | "embedded";
  mode?: GamePlayMode;
  actions?: TowerStackActions;
};

export const GamePlayer = ({
  gameId,
  initialState,
  variant = "standalone",
  mode = "practice",
  actions,
}: GamePlayerProps) => {
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
