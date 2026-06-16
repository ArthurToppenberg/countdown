import { render } from "@react-email/render";

import { sendReactEmail } from "../client";
import { requireUserName } from "../require-user-name";
import { type DagligEmailSendInput } from "../types";
import { buildGameUrl } from "../urls";
import {
  DagligEmail,
  type DagligEmailProps,
  getDagligEmailSubject,
} from "../templates/daglig-email";

type DagligEmailContentProps = Omit<DagligEmailProps, "gameUrl">;

const enrichDagligEmailProps = (
  input: DagligEmailContentProps,
): DagligEmailProps => ({
  ...input,
  gameUrl: buildGameUrl(),
});

export const renderDagligEmailHtml = async (
  input: DagligEmailContentProps,
): Promise<string> => render(DagligEmail(enrichDagligEmailProps(input)));

export const sendDagligEmail = async (
  input: DagligEmailSendInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende daglig e-mail",
  );
  const props = enrichDagligEmailProps({
    name,
    eventName: input.eventName,
    daysRemainingLabel: input.daysRemainingLabel,
  });

  await sendReactEmail({
    emailType: "daglig",
    to: input.to,
    subject: getDagligEmailSubject(props),
    react: DagligEmail(props),
  });
};

export {
  getDagligEmailSubject,
  getDagligEmailTitle,
} from "../templates/daglig-email";
