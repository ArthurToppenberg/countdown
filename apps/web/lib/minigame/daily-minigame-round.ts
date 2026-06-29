import { minigameIds } from "@countdown/minigame";

import prisma from "@/lib/prisma";

import { getCopenhagenDateKey } from "./copenhagen-date";
import { pickGameForDate } from "./pick-daily-game";

export type DailyMinigameRound = {
  copenhagenDateKey: string;
  gameId: string;
};

const toDailyMinigameRound = (round: {
  copenhagenDateKey: string;
  gameId: string;
}): DailyMinigameRound => ({
  copenhagenDateKey: round.copenhagenDateKey,
  gameId: round.gameId,
});

export const getTodaysDailyMinigame = async (): Promise<DailyMinigameRound | null> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());
  const round = await prisma.dailyMinigame.findUnique({
    where: { copenhagenDateKey },
    select: {
      copenhagenDateKey: true,
      gameId: true,
    },
  });

  if (!round) {
    return null;
  }

  return toDailyMinigameRound(round);
};

export const getOrCreateTodaysDailyMinigame = async (): Promise<DailyMinigameRound> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());
  const existingRound = await prisma.dailyMinigame.findUnique({
    where: { copenhagenDateKey },
    select: {
      copenhagenDateKey: true,
      gameId: true,
    },
  });

  if (existingRound) {
    return toDailyMinigameRound(existingRound);
  }

  const gameId = pickGameForDate(copenhagenDateKey, minigameIds());

  try {
    const createdRound = await prisma.dailyMinigame.create({
      data: {
        copenhagenDateKey,
        gameId,
      },
      select: {
        copenhagenDateKey: true,
        gameId: true,
      },
    });

    return toDailyMinigameRound(createdRound);
  } catch {
    const racedRound = await prisma.dailyMinigame.findUnique({
      where: { copenhagenDateKey },
      select: {
        copenhagenDateKey: true,
        gameId: true,
      },
    });

    if (!racedRound) {
      throw new Error(`Failed to resolve daily minigame for ${copenhagenDateKey}`);
    }

    return toDailyMinigameRound(racedRound);
  }
};
