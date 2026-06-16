import prisma from "@/lib/prisma";

import { isSameCopenhagenDay } from "./copenhagen-date";

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
  const latestMinigame = await prisma.minigame.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      points: true,
      createdAt: true,
    },
  });

  if (!latestMinigame) {
    return null;
  }

  if (!isSameCopenhagenDay(latestMinigame.createdAt, new Date())) {
    return null;
  }

  return latestMinigame;
};

export const saveMinigamePoints = async (
  userId: string,
  points: number,
): Promise<void> => {
  const existingScore = await getTodaysMinigameScore(userId);

  if (existingScore) {
    return;
  }

  await prisma.minigame.create({
    data: {
      userId,
      points: Math.round(points),
    },
  });
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
