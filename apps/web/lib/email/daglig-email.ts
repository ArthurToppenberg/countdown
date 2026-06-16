import {
  getDagligEmailSubject,
  getDagligEmailTitle,
  renderDagligEmailHtml,
  sendDagligEmail as sendDagligEmailWithEvent,
  type DagligEmailEventProps,
} from "@countdown/email";

import { getMinigamePointsLeaderboard } from "@/lib/minigame/daily-minigame";
import { getNextEvent } from "@/lib/next-event";

export type DagligEmailInput = {
  to: string;
  name: string;
};

export const buildDagligEmailProps = async (): Promise<
  DagligEmailEventProps | undefined
> => {
  const [nextEvent, leaderboardEntries] = await Promise.all([
    getNextEvent(),
    getMinigamePointsLeaderboard(3),
  ]);

  if (!nextEvent) {
    return undefined;
  }

  return {
    eventName: nextEvent.name,
    daysRemainingLabel: nextEvent.daysRemainingLabel,
    leaderboard: leaderboardEntries.map((entry) => ({
      name: entry.name,
      points: entry.points,
    })),
  };
};

export const sendDagligEmail = async (
  input: DagligEmailInput,
): Promise<void> => {
  const eventProps = await buildDagligEmailProps();

  if (!eventProps) {
    throw new Error("Ingen kommende begivenhed at sende daglig e-mail for");
  }

  await sendDagligEmailWithEvent({ ...input, ...eventProps });
};

export {
  getDagligEmailSubject,
  getDagligEmailTitle,
  renderDagligEmailHtml,
  type DagligEmailEventProps,
};
