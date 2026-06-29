import { TOWER_STACK_ID, type TowerStackActions } from "@countdown/minigame";

import {
  competitiveResetNotAllowed as towerStackCompetitiveResetNotAllowed,
  dropCompetitiveTowerStackBlock,
  settleCompetitiveTowerStackBlock,
  tickCompetitiveTowerStack,
} from "./competitive-tower-stack-actions";

export const getCompetitiveMinigameActions = (
  gameId: string,
): TowerStackActions | null => {
  if (gameId === TOWER_STACK_ID) {
    return {
      dropBlock: dropCompetitiveTowerStackBlock,
      settleBlock: settleCompetitiveTowerStackBlock,
      tick: tickCompetitiveTowerStack,
      reset: towerStackCompetitiveResetNotAllowed,
    };
  }

  return null;
};
