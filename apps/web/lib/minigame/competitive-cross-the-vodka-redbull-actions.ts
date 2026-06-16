"use server";

import {
  cashOutCrossTheVodkaRedbull,
  clearCrossTheVodkaRedbullSession,
  takeCrossTheVodkaRedbullStep,
  type CrossTheVodkaRedbullActionResult,
  type CrossTheVodkaRedbullPublicState,
} from "@countdown/minigame";

import { getSession } from "@/lib/auth";

import {
  getTodaysMinigameScore,
  saveMinigamePoints,
} from "./daily-minigame";

const requirePlayableSession = async (): Promise<string> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Du skal være logget ind for at spille.");
  }

  const todaysScore = await getTodaysMinigameScore(session.userId);

  if (todaysScore) {
    throw new Error("Du har allerede spillet dagens minigame.");
  }

  return session.userId;
};

const persistScoreIfEnded = async (
  userId: string,
  state: CrossTheVodkaRedbullPublicState,
): Promise<void> => {
  if (state.phase !== "ended") {
    return;
  }

  await saveMinigamePoints(userId, state.bankroll);
  await clearCrossTheVodkaRedbullSession("competitive");
};

const withCompetitiveGuards = async (
  action: () => Promise<CrossTheVodkaRedbullActionResult>,
): Promise<CrossTheVodkaRedbullActionResult> => {
  const userId = await requirePlayableSession();
  const result = await action();
  await persistScoreIfEnded(userId, result.state);
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
