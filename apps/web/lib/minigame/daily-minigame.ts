import prisma from "@/lib/prisma";

import { getCopenhagenDateKey } from "./copenhagen-date";
import { getOrCreateTodaysDailyMinigame } from "./daily-minigame-round";

export type StoredMinigameScore = {
  id: string;
  points: number;
  createdAt: Date;
};

export type MinigameLeaderboardEntry = {
  userId: string;
  name: string;
  points: number;
};

export const getTodaysMinigameScore = async (
  userId: string,
): Promise<StoredMinigameScore | null> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());

  return prisma.minigame.findUnique({
    where: {
      dailyMinigameId_userId: {
        dailyMinigameId: copenhagenDateKey,
        userId,
      },
    },
    select: {
      id: true,
      points: true,
      createdAt: true,
    },
  });
};

export const saveMinigamePoints = async (
  userId: string,
  dailyMinigameId: string,
  points: number,
): Promise<void> => {
  const todaysRound = await getOrCreateTodaysDailyMinigame();

  if (todaysRound.copenhagenDateKey !== dailyMinigameId) {
    throw new Error("Score can only be saved for today's minigame round.");
  }

  try {
    await prisma.minigame.create({
      data: {
        userId,
        dailyMinigameId,
        points: Math.round(points),
      },
    });
  } catch {
    const existingScore = await getTodaysMinigameScore(userId);

    if (existingScore) {
      return;
    }

    throw new Error("Failed to save minigame score.");
  }
};

export const getMinigamePointsLeaderboard = async (
  limit: number,
): Promise<MinigameLeaderboardEntry[]> => {
  const aggregated = await prisma.minigame.groupBy({
    by: ["userId"],
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: limit,
  });

  if (aggregated.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: aggregated.map((entry) => entry.userId) },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return aggregated.flatMap((entry) => {
    const user = userById.get(entry.userId);
    const totalPoints = entry._sum.points;

    if (!user || totalPoints === null) {
      return [];
    }

    const trimmedName = user.name?.trim();

    return [
      {
        userId: entry.userId,
        name: trimmedName ? trimmedName : user.email,
        points: totalPoints,
      },
    ];
  });
};
