import {
  getDagligEmailSubject,
  getDagligEmailTitle,
  renderDagligEmailHtml,
  sendDagligEmail as sendDagligEmailWithEvent,
  type DagligEmailEventProps,
} from "@countdown/email";

import { getNextEvent } from "@/lib/next-event";

export type DagligEmailInput = {
  to: string;
  name: string;
};

export const buildDagligEmailProps = async (): Promise<
  DagligEmailEventProps | undefined
> => {
  const nextEvent = await getNextEvent();

  if (!nextEvent) {
    return undefined;
  }

  return {
    eventName: nextEvent.name,
    daysRemainingLabel: nextEvent.daysRemainingLabel,
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
