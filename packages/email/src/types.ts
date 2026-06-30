export type SetPasswordEmailInput = {
  to: string;
  name: string;
  setPasswordUrl: string;
};

export type DagligEmailLeaderboardEntry = {
  name: string;
  points: number;
};

export type DagligEmailEventProps = {
  eventName: string;
  daysRemainingLabel: string;
  countdownNote: string;
  seasonName: string | null;
  leaderboard: DagligEmailLeaderboardEntry[];
  weeklyLeaderName: string | null;
  hasActiveGame: boolean;
};

export type DagligEmailSendInput = DagligEmailEventProps & {
  to: string;
  name: string;
};

export type ChampionEmailSendInput = {
  to: string;
  name: string;
  festivalName: string;
  leaguePoints: number;
};
