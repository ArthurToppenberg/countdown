export type DailyRawScore = {
  userId: string;
  points: number;
};

export type SeasonRawScore = {
  dailyGameId: string;
  userId: string;
  points: number;
};

export type LeagueStanding = {
  userId: string;
  leaguePoints: number;
};

const LEAGUE_POINTS_BY_RANK: readonly number[] = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const PARTICIPATION_POINTS = 1;

export const leaguePointsForRank = (rank: number): number => {
  if (!Number.isInteger(rank) || rank < 1) {
    throw new Error(`League rank must be a positive integer, received ${rank}`);
  }

  const index = rank - 1;

  if (index < LEAGUE_POINTS_BY_RANK.length) {
    return LEAGUE_POINTS_BY_RANK[index];
  }

  return PARTICIPATION_POINTS;
};

export const computeDailyLeaguePoints = (
  scores: readonly DailyRawScore[],
): Map<string, number> => {
  return scores.reduce((leaguePointsByUser, score) => {
    const higherScoreCount = scores.filter(
      (other) => other.points > score.points,
    ).length;
    const rank = higherScoreCount + 1;

    leaguePointsByUser.set(score.userId, leaguePointsForRank(rank));

    return leaguePointsByUser;
  }, new Map<string, number>());
};

const groupScoresByDay = (
  scores: readonly SeasonRawScore[],
): Map<string, DailyRawScore[]> => {
  return scores.reduce((scoresByDay, score) => {
    const dayScores = scoresByDay.get(score.dailyGameId) ?? [];
    dayScores.push({ userId: score.userId, points: score.points });
    scoresByDay.set(score.dailyGameId, dayScores);

    return scoresByDay;
  }, new Map<string, DailyRawScore[]>());
};

export const aggregateSeasonLeaguePoints = (
  scores: readonly SeasonRawScore[],
): LeagueStanding[] => {
  const scoresByDay = groupScoresByDay(scores);

  const leagueTotals = Array.from(scoresByDay.values()).reduce(
    (totals, dayScores) => {
      const dailyLeaguePoints = computeDailyLeaguePoints(dayScores);

      dailyLeaguePoints.forEach((points, userId) => {
        totals.set(userId, (totals.get(userId) ?? 0) + points);
      });

      return totals;
    },
    new Map<string, number>(),
  );

  return Array.from(leagueTotals.entries())
    .map(([userId, leaguePoints]) => ({ userId, leaguePoints }))
    .sort((left, right) => right.leaguePoints - left.leaguePoints);
};

export type LeagueChampion = {
  userId: string;
  leaguePoints: number;
  firstPlaceDays: number;
  clinchedOnKey: string;
};

const buildChampionStats = (
  scores: readonly SeasonRawScore[],
): LeagueChampion[] => {
  const scoresByDay = groupScoresByDay(scores);
  const topPoints = leaguePointsForRank(1);

  const totals = new Map<string, number>();
  const firstPlaceDays = new Map<string, number>();
  const clinchedOnKey = new Map<string, string>();

  Array.from(scoresByDay.keys())
    .sort()
    .forEach((dayKey) => {
      const dayScores = scoresByDay.get(dayKey);

      if (!dayScores) {
        return;
      }

      computeDailyLeaguePoints(dayScores).forEach((points, userId) => {
        totals.set(userId, (totals.get(userId) ?? 0) + points);
        clinchedOnKey.set(userId, dayKey);

        if (points === topPoints) {
          firstPlaceDays.set(userId, (firstPlaceDays.get(userId) ?? 0) + 1);
        }
      });
    });

  return Array.from(totals.entries()).map(([userId, leaguePoints]) => ({
    userId,
    leaguePoints,
    firstPlaceDays: firstPlaceDays.get(userId) ?? 0,
    clinchedOnKey: clinchedOnKey.get(userId) ?? "",
  }));
};

const isBetterChampion = (
  candidate: LeagueChampion,
  current: LeagueChampion,
): boolean => {
  if (candidate.leaguePoints !== current.leaguePoints) {
    return candidate.leaguePoints > current.leaguePoints;
  }

  if (candidate.firstPlaceDays !== current.firstPlaceDays) {
    return candidate.firstPlaceDays > current.firstPlaceDays;
  }

  if (candidate.clinchedOnKey !== current.clinchedOnKey) {
    return candidate.clinchedOnKey < current.clinchedOnKey;
  }

  return candidate.userId < current.userId;
};

export const resolveLeagueChampion = (
  scores: readonly SeasonRawScore[],
): LeagueChampion | null => {
  const stats = buildChampionStats(scores);

  if (stats.length === 0) {
    return null;
  }

  return stats.reduce((best, candidate) =>
    isBetterChampion(candidate, best) ? candidate : best,
  );
};
