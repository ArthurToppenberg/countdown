import { TOWER_STACK_ID, type TowerStackActions } from "@countdown/game";

import { submitCompetitiveTowerStackResult } from "./competitive-tower-stack-actions";

export const getCompetitiveGameActions = (
  gameId: string,
): TowerStackActions | null => {
  if (gameId === TOWER_STACK_ID) {
    return {
      submitResult: submitCompetitiveTowerStackResult,
    };
  }

  return null;
};
