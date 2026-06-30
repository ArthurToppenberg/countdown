"use server";

import {
  TOWER_STACK_ID,
  type TowerStackResultPayload,
  type TowerStackSubmitResult,
} from "@countdown/game";

import { getSession } from "@/lib/auth";

import {
  getCurrentSeason,
  getTodaysGameScore,
  saveGamePoints,
} from "./daily-game";
import { getOrCreateTodaysDailyGame } from "./daily-game-round";
import { isScoringOpen } from "./festival-season";

const requirePlayableSession = async (): Promise<{
  userId: string;
  dailyGameId: string;
}> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Du skal være logget ind for at spille.");
  }

  const now = new Date();
  const { state } = await getCurrentSeason(now);

  if (!isScoringOpen(state, now)) {
    throw new Error(
      "Sæsonen er på pause under festivalen — der er ingen game i dag.",
    );
  }

  const todaysScore = await getTodaysGameScore(session.userId);

  if (todaysScore) {
    throw new Error("Du har allerede spillet dagens game.");
  }

  const todaysRound = await getOrCreateTodaysDailyGame();

  if (todaysRound.gameId !== TOWER_STACK_ID) {
    throw new Error("Dagens game er et andet spil.");
  }

  return {
    userId: session.userId,
    dailyGameId: todaysRound.copenhagenDateKey,
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
  const { userId, dailyGameId } = await requirePlayableSession();

  await saveGamePoints(userId, dailyGameId, payload.score);

  return { success: true };
};
