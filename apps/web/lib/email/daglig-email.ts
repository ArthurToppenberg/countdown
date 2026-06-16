import {
  getDagligEmailSubject,
  getDagligEmailTitle,
  renderDagligEmailHtml,
  requireUserName,
  sendDagligEmail as sendDagligEmailWithEvent,
  type DagligEmailEventProps,
} from "@countdown/email";

import { logger } from "@/lib/logger";
import { getMinigamePointsLeaderboard } from "@/lib/minigame/daily-minigame";
import { getNextEvent } from "@/lib/next-event";
import prisma from "@/lib/prisma";

export type DagligEmailInput = {
  to: string;
  name: string;
};

export type DagligEmailBatchResult = {
  sent: number;
  failed: { email: string; error: string }[];
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

export const sendDagligEmailToActiveUsers =
  async (): Promise<DagligEmailBatchResult> => {
    const eventProps = await buildDagligEmailProps();

    if (!eventProps) {
      throw new Error("Ingen kommende begivenhed at sende daglig e-mail for");
    }

    const users = await prisma.user.findMany({
      where: { password: { not: null } },
      select: { email: true, name: true },
    });

    const result: DagligEmailBatchResult = { sent: 0, failed: [] };

    for (const user of users) {
      try {
        await sendDagligEmailWithEvent({
          ...eventProps,
          to: user.email,
          name: requireUserName(
            user.name,
            "Bruger mangler navn — kan ikke sende daglig e-mail",
          ),
        });
        result.sent += 1;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        logger.error("Daglig", "Failed to send daily email to user", {
          email: user.email,
          errorMessage,
        });

        result.failed.push({ email: user.email, error: errorMessage });
      }
    }

    return result;
  };

export {
  getDagligEmailSubject,
  getDagligEmailTitle,
  renderDagligEmailHtml,
  type DagligEmailEventProps,
};
