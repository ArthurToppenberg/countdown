import { getEventCountdown } from "@/lib/event-countdown";

import { getCopenhagenDateKey } from "./copenhagen-date";
import {
  resolveLeagueChampion,
  type SeasonRawScore,
} from "./league-points";

export type SeasonEvent = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

export type FestivalSeason = {
  seasonNumber: number;
  festivalId: string;
  festivalName: string;
  start: Date | null;
  lock: Date;
  festivalEnd: Date;
};

export type SeasonWindow = {
  afterKey: string | null;
  beforeKey: string;
};

export type CurrentSeasonState = {
  season: FestivalSeason | null;
  inFestival: boolean;
  nextSeasonStart: Date | null;
  nextSeason: FestivalSeason | null;
};

export type SeasonChampion = {
  seasonNumber: number;
  festivalId: string;
  festivalName: string;
  userId: string;
  leaguePoints: number;
};

export const resolveSeasons = (
  events: readonly SeasonEvent[],
): FestivalSeason[] => {
  const sorted = [...events].sort(
    (left, right) => left.startDate.getTime() - right.startDate.getTime(),
  );

  return sorted.map((event, index) => {
    const previous = index > 0 ? sorted[index - 1] : undefined;

    return {
      seasonNumber: index + 1,
      festivalId: event.id,
      festivalName: event.name,
      start: previous ? previous.endDate : null,
      lock: event.startDate,
      festivalEnd: event.endDate,
    };
  });
};

export const getSeasonWindow = (season: FestivalSeason): SeasonWindow => ({
  afterKey: season.start ? getCopenhagenDateKey(season.start) : null,
  beforeKey: getCopenhagenDateKey(season.lock),
});

export const isDayInSeasonWindow = (
  dayKey: string,
  window: SeasonWindow,
): boolean =>
  (window.afterKey === null || dayKey > window.afterKey) &&
  dayKey < window.beforeKey;

export const isScoringOpen = (
  state: CurrentSeasonState,
  date: Date,
): boolean => {
  if (state.inFestival || !state.season) {
    return false;
  }

  return isDayInSeasonWindow(
    getCopenhagenDateKey(date),
    getSeasonWindow(state.season),
  );
};

export const getSeasonForDate = (
  seasons: readonly FestivalSeason[],
  date: Date,
): CurrentSeasonState => {
  const time = date.getTime();

  const festivalSeason = seasons.find(
    (season) =>
      time >= season.lock.getTime() && time <= season.festivalEnd.getTime(),
  );

  if (festivalSeason) {
    const nextSeason = seasons.find(
      (season) =>
        season.start !== null &&
        season.start.getTime() === festivalSeason.festivalEnd.getTime(),
    );

    return {
      season: festivalSeason,
      inFestival: true,
      nextSeasonStart: festivalSeason.festivalEnd,
      nextSeason: nextSeason ?? null,
    };
  }

  const accumulating = seasons.find(
    (season) =>
      time < season.lock.getTime() &&
      (season.start === null || time >= season.start.getTime()),
  );

  return {
    season: accumulating ?? null,
    inFestival: false,
    nextSeasonStart: null,
    nextSeason: null,
  };
};

export const getSeasonChampions = (
  seasons: readonly FestivalSeason[],
  scores: readonly SeasonRawScore[],
  now: Date,
): SeasonChampion[] => {
  const nowTime = now.getTime();

  return seasons
    .filter((season) => nowTime >= season.lock.getTime())
    .flatMap((season) => {
      const window = getSeasonWindow(season);
      const seasonScores = scores.filter((score) =>
        isDayInSeasonWindow(score.dailyGameId, window),
      );
      const champion = resolveLeagueChampion(seasonScores);

      if (!champion) {
        return [];
      }

      return [
        {
          seasonNumber: season.seasonNumber,
          festivalId: season.festivalId,
          festivalName: season.festivalName,
          userId: champion.userId,
          leaguePoints: champion.leaguePoints,
        },
      ];
    });
};

export type SeasonCountdown = {
  eventName: string;
  daysRemainingLabel: string;
  countdownNote: string;
  seasonName: string | null;
  targetDate: Date;
};

const countdownLabel = (target: Date, now: Date): string =>
  getEventCountdown(target, target, now).label;

export const getSeasonName = (season: FestivalSeason): string =>
  `${season.festivalName} Season`;

export const getSeasonCountdown = (
  state: CurrentSeasonState,
  now: Date,
): SeasonCountdown | null => {
  if (!state.season) {
    return null;
  }

  if (state.inFestival && state.nextSeasonStart) {
    const nextSeasonName = state.nextSeason
      ? getSeasonName(state.nextSeason)
      : null;

    return {
      eventName: `når ${state.season.festivalName} slutter`,
      daysRemainingLabel: countdownLabel(state.nextSeasonStart, now),
      countdownNote: nextSeasonName ? `til ${nextSeasonName}` : "til ny sæson",
      seasonName: nextSeasonName,
      targetDate: state.nextSeasonStart,
    };
  }

  return {
    eventName: state.season.festivalName,
    daysRemainingLabel: countdownLabel(state.season.lock, now),
    countdownNote: "til sæsonfinale",
    seasonName: getSeasonName(state.season),
    targetDate: state.season.lock,
  };
};

export const getSeasonsLockedSince = (
  seasons: readonly FestivalSeason[],
  now: Date,
  sinceMs: number,
): FestivalSeason[] => {
  const upperBound = now.getTime();
  const lowerBound = upperBound - sinceMs;

  return seasons.filter((season) => {
    const lockTime = season.lock.getTime();

    return lockTime > lowerBound && lockTime <= upperBound;
  });
};
