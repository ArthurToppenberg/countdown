import prisma from "@/lib/prisma";

import {
  getCopenhagenDateKey,
  getCopenhagenWeekRange,
} from "./copenhagen-date";
import { getOrCreateTodaysDailyGame } from "./daily-game-round";
import {
  aggregateSeasonLeaguePoints,
  type LeagueStanding,
} from "./league-points";
import {
  getSeasonChampions,
  getSeasonForDate,
  resolveSeasons,
  type CurrentSeasonState,
  type FestivalSeason,
  type SeasonChampion,
  type SeasonWindow,
} from "./festival-season";

export type StoredGameScore = {
  id: string;
  points: number;
  createdAt: Date;
};

export type GameLeaderboardEntry = {
  userId: string;
  name: string;
  points: number;
};

export const getTodaysGameScore = async (
  userId: string,
): Promise<StoredGameScore | null> => {
  const copenhagenDateKey = getCopenhagenDateKey(new Date());

  return prisma.game.findUnique({
    where: {
      dailyGameId_userId: {
        dailyGameId: copenhagenDateKey,
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

export const saveGamePoints = async (
  userId: string,
  dailyGameId: string,
  points: number,
): Promise<void> => {
  const todaysRound = await getOrCreateTodaysDailyGame();

  if (todaysRound.copenhagenDateKey !== dailyGameId) {
    throw new Error("Score can only be saved for today's game round.");
  }

  try {
    await prisma.game.create({
      data: {
        userId,
        dailyGameId,
        points: Math.round(points),
      },
    });
  } catch {
    const existingScore = await getTodaysGameScore(userId);

    if (existingScore) {
      return;
    }

    throw new Error("Failed to save game score.");
  }
};

const resolveLeaderboardEntries = async (
  standings: readonly LeagueStanding[],
  limit: number,
): Promise<GameLeaderboardEntry[]> => {
  const topStandings = standings.slice(0, limit);

  if (topStandings.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: topStandings.map((standing) => standing.userId) },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return topStandings.flatMap((standing) => {
    const user = userById.get(standing.userId);

    if (!user) {
      return [];
    }

    const trimmedName = user.name?.trim();

    return [
      {
        userId: standing.userId,
        name: trimmedName ? trimmedName : user.email,
        points: standing.leaguePoints,
      },
    ];
  });
};

export const getGamePointsLeaderboard = async (
  limit: number,
): Promise<GameLeaderboardEntry[]> => {
  const rawScores = await prisma.game.findMany({
    select: {
      dailyGameId: true,
      userId: true,
      points: true,
    },
  });

  return resolveLeaderboardEntries(aggregateSeasonLeaguePoints(rawScores), limit);
};

export const getSeasonLeaguePoints = async (
  window: SeasonWindow,
  limit: number,
): Promise<GameLeaderboardEntry[]> => {
  const rawScores = await prisma.game.findMany({
    where: {
      dailyGameId: {
        lt: window.beforeKey,
        ...(window.afterKey !== null && { gt: window.afterKey }),
      },
    },
    select: {
      dailyGameId: true,
      userId: true,
      points: true,
    },
  });

  return resolveLeaderboardEntries(aggregateSeasonLeaguePoints(rawScores), limit);
};

export const getWeekLeaguePoints = async (
  date: Date,
  limit: number,
): Promise<GameLeaderboardEntry[]> => {
  const { fromKey, toKey } = getCopenhagenWeekRange(date);

  const rawScores = await prisma.game.findMany({
    where: {
      dailyGameId: { gte: fromKey, lte: toKey },
    },
    select: {
      dailyGameId: true,
      userId: true,
      points: true,
    },
  });

  return resolveLeaderboardEntries(aggregateSeasonLeaguePoints(rawScores), limit);
};

const loadSeasonEvents = (): Promise<FestivalSeason[]> =>
  prisma.event
    .findMany({
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, startDate: true, endDate: true },
    })
    .then((events) => resolveSeasons(events));

export type CurrentSeason = {
  seasons: FestivalSeason[];
  state: CurrentSeasonState;
};

export const getCurrentSeason = async (now: Date): Promise<CurrentSeason> => {
  const seasons = await loadSeasonEvents();

  return { seasons, state: getSeasonForDate(seasons, now) };
};

export type SeasonChampionEntry = SeasonChampion & {
  name: string;
};

export const getSeasonChampionHistory = async (
  seasons: readonly FestivalSeason[],
  now: Date,
): Promise<SeasonChampionEntry[]> => {
  const rawScores = await prisma.game.findMany({
    select: {
      dailyGameId: true,
      userId: true,
      points: true,
    },
  });

  const champions = getSeasonChampions(seasons, rawScores, now);

  if (champions.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: { id: { in: champions.map((champion) => champion.userId) } },
    select: { id: true, name: true, email: true },
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return champions.flatMap((champion) => {
    const user = userById.get(champion.userId);

    if (!user) {
      return [];
    }

    const trimmedName = user.name?.trim();

    return [
      {
        ...champion,
        name: trimmedName ? trimmedName : user.email,
      },
    ];
  });
};
