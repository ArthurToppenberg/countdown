import { TOWER_STACK_ID, type TowerStackActions } from "@countdown/minigame";

import {
  competitiveResetNotAllowed as towerStackCompetitiveResetNotAllowed,
  dropCompetitiveTowerStackBlock,
  settleCompetitiveTowerStackBlock,
} from "./competitive-tower-stack-actions";

export const getCompetitiveMinigameActions = (
  gameId: string,
): TowerStackActions | null => {
  if (gameId === TOWER_STACK_ID) {
    return {
      dropBlock: dropCompetitiveTowerStackBlock,
      settleBlock: settleCompetitiveTowerStackBlock,
      reset: towerStackCompetitiveResetNotAllowed,
    };
  }

  return null;
};
