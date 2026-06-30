import { gameIds } from "@countdown/game";

import prisma from "@/lib/prisma";

import { getCopenhagenDateKey } from "./copenhagen-date";
import { pickGameForDate } from "./pick-daily-game";

export type DailyGameRound = {
  copenhagenDateKey: string;
  gameId: string;
};

const toDailyGameRound = (round: {
  copenhagenDateKey: string;
  gameId: string;
}): DailyGameRound => ({
  copenhagenDateKey: round.copenhagenDateKey,
  gameId: round.gameId,
});

export const getTodaysDailyGame = async (): Promise<DailyGameRound | null> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());
  const round = await prisma.dailyGame.findUnique({
    where: { copenhagenDateKey },
    select: {
      copenhagenDateKey: true,
      gameId: true,
    },
  });

  if (!round) {
    return null;
  }

  return toDailyGameRound(round);
};

export const getOrCreateTodaysDailyGame = async (): Promise<DailyGameRound> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());
  const existingRound = await prisma.dailyGame.findUnique({
    where: { copenhagenDateKey },
    select: {
      copenhagenDateKey: true,
      gameId: true,
    },
  });

  if (existingRound) {
    return toDailyGameRound(existingRound);
  }

  const gameId = pickGameForDate(copenhagenDateKey, gameIds());

  try {
    const createdRound = await prisma.dailyGame.create({
      data: {
        copenhagenDateKey,
        gameId,
      },
      select: {
        copenhagenDateKey: true,
        gameId: true,
      },
    });

    return toDailyGameRound(createdRound);
  } catch {
    const racedRound = await prisma.dailyGame.findUnique({
      where: { copenhagenDateKey },
      select: {
        copenhagenDateKey: true,
        gameId: true,
      },
    });

    if (!racedRound) {
      throw new Error(`Failed to resolve daily game for ${copenhagenDateKey}`);
    }

    return toDailyGameRound(racedRound);
  }
};
