"use server";

import {
  clearTowerStackSession,
  dropTowerStackBlock,
  settleTowerStackBlock,
  TOWER_STACK_ID,
  type TowerStackActionResult,
  type TowerStackPublicState,
} from "@countdown/minigame";

import { assertNoActiveEventForMinigame } from "@/lib/active-event";
import { getSession } from "@/lib/auth";

import {
  getTodaysMinigameScore,
  saveMinigamePoints,
} from "./daily-minigame";
import { getOrCreateTodaysDailyMinigame } from "./daily-minigame-round";

const requirePlayableSession = async (): Promise<{
  userId: string;
  dailyMinigameId: string;
}> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Du skal være logget ind for at spille.");
  }

  await assertNoActiveEventForMinigame();

  const todaysScore = await getTodaysMinigameScore(session.userId);

  if (todaysScore) {
    throw new Error("Du har allerede spillet dagens minigame.");
  }

  const todaysRound = await getOrCreateTodaysDailyMinigame();

  if (todaysRound.gameId !== TOWER_STACK_ID) {
    throw new Error("Dagens minigame er et andet spil.");
  }

  return {
    userId: session.userId,
    dailyMinigameId: todaysRound.copenhagenDateKey,
  };
};

const persistScoreIfEnded = async (
  userId: string,
  dailyMinigameId: string,
  state: TowerStackPublicState,
): Promise<void> => {
  if (state.phase !== "ended") {
    return;
  }

  await saveMinigamePoints(userId, dailyMinigameId, state.totalScore);
  await clearTowerStackSession("competitive");
};

const withCompetitiveGuards = async (
  action: () => Promise<TowerStackActionResult>,
): Promise<TowerStackActionResult> => {
  const { userId, dailyMinigameId } = await requirePlayableSession();
  const result = await action();
  await persistScoreIfEnded(userId, dailyMinigameId, result.state);
  return result;
};

export const dropCompetitiveTowerStackBlock =
  async (): Promise<TowerStackActionResult> =>
    withCompetitiveGuards(() => dropTowerStackBlock("competitive"));

export const settleCompetitiveTowerStackBlock =
  async (): Promise<TowerStackActionResult> =>
    withCompetitiveGuards(() => settleTowerStackBlock("competitive"));

const competitiveResetNotAllowed =
  async (): Promise<TowerStackActionResult> => {
    throw new Error("Dagens minigame kan ikke nulstilles.");
  };

export { competitiveResetNotAllowed };
