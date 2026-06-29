import {
  CROSS_THE_VODKA_REDBULL_ID,
  type CrossTheVodkaRedbullActions,
} from "@countdown/minigame";

import {
  cashOutCompetitiveCrossTheVodkaRedbull,
  competitiveResetNotAllowed,
  takeCompetitiveCrossTheVodkaRedbullStep,
} from "./competitive-cross-the-vodka-redbull-actions";

export const getCompetitiveMinigameActions = (
  gameId: string,
): CrossTheVodkaRedbullActions | null => {
  if (gameId === CROSS_THE_VODKA_REDBULL_ID) {
    return {
      takeStep: takeCompetitiveCrossTheVodkaRedbullStep,
      cashOut: cashOutCompetitiveCrossTheVodkaRedbull,
      reset: competitiveResetNotAllowed,
    };
  }

  return null;
};
