import prisma from "@/lib/prisma";

export type ActiveEventInfo = {
  id: string;
  name: string;
};

export const ACTIVE_EVENT_MINIGAME_ERROR =
  "Minigames er lukket mens en begivenhed er i gang.";

export const getActiveEvent = async (
  now: Date = new Date(),
): Promise<ActiveEventInfo | undefined> => {
  const event = await prisma.event
    .findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        name: true,
      },
    })
    .catch(() => undefined);

  if (!event) {
    return undefined;
  }

  return event;
};

export const assertNoActiveEventForMinigame = async (): Promise<void> => {
  const activeEvent = await getActiveEvent();

  if (activeEvent) {
    throw new Error(ACTIVE_EVENT_MINIGAME_ERROR);
  }
};
