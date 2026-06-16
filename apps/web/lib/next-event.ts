import { getEventCountdown } from "@/lib/event-countdown";
import prisma from "@/lib/prisma";

export type NextEventInfo = {
  name: string;
  daysRemainingLabel: string;
};

export const getNextEvent = async (): Promise<NextEventInfo | undefined> => {
  const now = new Date();
  const event = await prisma.event
    .findFirst({
      where: {
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        startDate: "asc",
      },
    })
    .catch(() => undefined);

  if (!event) {
    return undefined;
  }

  const countdown = getEventCountdown(event.startDate, event.endDate, now);

  return {
    name: event.name,
    daysRemainingLabel: countdown.label,
  };
};
