import { TOWER_STACK_ID, type TowerStackActions } from "@countdown/minigame";

import { submitCompetitiveTowerStackResult } from "./competitive-tower-stack-actions";

export const getCompetitiveMinigameActions = (
  gameId: string,
): TowerStackActions | null => {
  if (gameId === TOWER_STACK_ID) {
    return {
      submitResult: submitCompetitiveTowerStackResult,
    };
  }

  return null;
};
