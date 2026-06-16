import { render } from "@react-email/render";

import {
  DagligEmail,
  type DagligEmailEventProps,
  type DagligEmailProps,
  getDagligEmailSubject,
} from "@/emails/daglig-email";
import { sendReactEmail } from "@/lib/email/client";
import { requireUserName } from "@/lib/email/require-user-name";
import { type DagligEmailInput } from "@/lib/email/types";
import { buildGameUrl } from "@/lib/email/urls";
import { getNextEvent } from "@/lib/next-event";

type DagligEmailContentProps = DagligEmailEventProps & {
  name: string;
};

const enrichDagligEmailProps = (
  input: DagligEmailContentProps,
): DagligEmailProps => ({
  ...input,
  gameUrl: buildGameUrl(),
});

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

export const renderDagligEmailHtml = async (
  input: DagligEmailContentProps,
): Promise<string> => render(DagligEmail(enrichDagligEmailProps(input)));

export const sendDagligEmail = async (
  input: DagligEmailInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende daglig e-mail",
  );
  const eventProps = await buildDagligEmailProps();

  if (!eventProps) {
    throw new Error("Ingen kommende begivenhed at sende daglig e-mail for");
  }

  const props = enrichDagligEmailProps({ ...eventProps, name });

  await sendReactEmail({
    emailType: "daglig",
    to: input.to,
    subject: getDagligEmailSubject(props),
    react: DagligEmail(props),
  });
};

export { getDagligEmailSubject, getDagligEmailTitle } from "@/emails/daglig-email";
