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
  leaderboard: DagligEmailLeaderboardEntry[];
  hasActiveMinigame: boolean;
};

export type DagligEmailSendInput = DagligEmailEventProps & {
  to: string;
  name: string;
};
