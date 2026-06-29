"use server";

import {
  CROSS_THE_VODKA_REDBULL_ID,
  cashOutCrossTheVodkaRedbull,
  clearCrossTheVodkaRedbullSession,
  takeCrossTheVodkaRedbullStep,
  type CrossTheVodkaRedbullActionResult,
  type CrossTheVodkaRedbullPublicState,
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

  if (todaysRound.gameId !== CROSS_THE_VODKA_REDBULL_ID) {
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
  state: CrossTheVodkaRedbullPublicState,
): Promise<void> => {
  if (state.phase !== "ended") {
    return;
  }

  await saveMinigamePoints(userId, dailyMinigameId, state.bankroll);
  await clearCrossTheVodkaRedbullSession("competitive");
};

const withCompetitiveGuards = async (
  action: () => Promise<CrossTheVodkaRedbullActionResult>,
): Promise<CrossTheVodkaRedbullActionResult> => {
  const { userId, dailyMinigameId } = await requirePlayableSession();
  const result = await action();
  await persistScoreIfEnded(userId, dailyMinigameId, result.state);
  return result;
};

export const takeCompetitiveCrossTheVodkaRedbullStep =
  async (): Promise<CrossTheVodkaRedbullActionResult> =>
    withCompetitiveGuards(() => takeCrossTheVodkaRedbullStep("competitive"));

export const cashOutCompetitiveCrossTheVodkaRedbull =
  async (): Promise<CrossTheVodkaRedbullActionResult> =>
    withCompetitiveGuards(() => cashOutCrossTheVodkaRedbull("competitive"));

const competitiveResetNotAllowed =
  async (): Promise<CrossTheVodkaRedbullActionResult> => {
    throw new Error("Dagens minigame kan ikke nulstilles.");
  };

export {
  competitiveResetNotAllowed,
};
