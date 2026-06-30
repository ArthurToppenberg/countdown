import { describe, expect, it } from "@jest/globals";

import {
  aggregateSeasonLeaguePoints,
  computeDailyLeaguePoints,
  leaguePointsForRank,
} from "./league-points";

describe("leaguePointsForRank", () => {
  it("awards the configured points for top ranks", () => {
    expect(leaguePointsForRank(1)).toBe(25);
    expect(leaguePointsForRank(2)).toBe(18);
    expect(leaguePointsForRank(5)).toBe(10);
    expect(leaguePointsForRank(10)).toBe(1);
  });

  it("awards a participation point beyond the configured ranks", () => {
    expect(leaguePointsForRank(11)).toBe(1);
    expect(leaguePointsForRank(50)).toBe(1);
  });

  it("rejects ranks that are not positive integers", () => {
    expect(() => leaguePointsForRank(0)).toThrow();
    expect(() => leaguePointsForRank(-3)).toThrow();
    expect(() => leaguePointsForRank(1.5)).toThrow();
  });
});

describe("computeDailyLeaguePoints", () => {
  it("ranks distinct scores from highest to lowest", () => {
    const result = computeDailyLeaguePoints([
      { userId: "a", points: 40 },
      { userId: "b", points: 30 },
      { userId: "c", points: 10 },
    ]);

    expect(result.get("a")).toBe(25);
    expect(result.get("b")).toBe(18);
    expect(result.get("c")).toBe(15);
  });

  it("gives tied players the same league points and skips the shared rank", () => {
    const result = computeDailyLeaguePoints([
      { userId: "a", points: 40 },
      { userId: "b", points: 40 },
      { userId: "c", points: 10 },
    ]);

    expect(result.get("a")).toBe(25);
    expect(result.get("b")).toBe(25);
    expect(result.get("c")).toBe(15);
  });

  it("gives every player the top points when all scores are equal", () => {
    const result = computeDailyLeaguePoints([
      { userId: "a", points: 5 },
      { userId: "b", points: 5 },
      { userId: "c", points: 5 },
    ]);

    expect(result.get("a")).toBe(25);
    expect(result.get("b")).toBe(25);
    expect(result.get("c")).toBe(25);
  });

  it("returns an empty map when nobody played", () => {
    expect(computeDailyLeaguePoints([]).size).toBe(0);
  });
});

describe("aggregateSeasonLeaguePoints", () => {
  it("sums daily league points across days and sorts descending", () => {
    const standings = aggregateSeasonLeaguePoints([
      { dailyGameId: "2026-06-29", userId: "a", points: 30 },
      { dailyGameId: "2026-06-29", userId: "b", points: 40 },
      { dailyGameId: "2026-06-30", userId: "a", points: 5 },
      { dailyGameId: "2026-06-30", userId: "b", points: 99 },
    ]);

    expect(standings).toEqual([
      { userId: "b", leaguePoints: 25 + 25 },
      { userId: "a", leaguePoints: 18 + 18 },
    ]);
  });

  it("keeps a player who missed a day from being buried by raw point scale", () => {
    const standings = aggregateSeasonLeaguePoints([
      { dailyGameId: "2026-06-28", userId: "active", points: 1000 },
      { dailyGameId: "2026-06-28", userId: "casual", points: 999 },
      { dailyGameId: "2026-06-29", userId: "active", points: 1000 },
      { dailyGameId: "2026-06-30", userId: "active", points: 1000 },
      { dailyGameId: "2026-06-30", userId: "casual", points: 1 },
    ]);

    const casual = standings.find((entry) => entry.userId === "casual");
    const active = standings.find((entry) => entry.userId === "active");

    expect(casual?.leaguePoints).toBe(18 + 18);
    expect(active?.leaguePoints).toBe(25 + 25 + 25);
  });

  it("returns an empty array when there are no scores", () => {
    expect(aggregateSeasonLeaguePoints([])).toEqual([]);
  });
});
