"use server";

import {
  TOWER_STACK_ID,
  type TowerStackResultPayload,
  type TowerStackSubmitResult,
} from "@countdown/minigame";

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

// The client simulates the whole game and submits the result once it ends.
//
// TODO: anti-cheat — re-simulate `payload.replay` through the shared pure logic
// (lockBlock/advanceTowerStackWorld/settleBlock) to derive the authoritative
// score server-side and reject mismatches. For now we trust the client score.
export const submitCompetitiveTowerStackResult = async (
  payload: TowerStackResultPayload,
): Promise<TowerStackSubmitResult> => {
  const { userId, dailyMinigameId } = await requirePlayableSession();

  await saveMinigamePoints(userId, dailyMinigameId, payload.score);

  return { success: true };
};
