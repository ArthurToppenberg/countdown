import { type ReactElement } from "react";
import { Resend } from "resend";

import { isEmailEnabled } from "./email-manifest";
import { logger } from "./logger";

type SendReactEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
  emailType?: string;
};

type ResendError = {
  name: string;
  message: string;
  statusCode?: number | null;
};

const getResendErrorMeta = (error: ResendError): Record<string, unknown> => ({
  errorName: error.name,
  errorMessage: error.message,
  ...(error.statusCode != null && { statusCode: error.statusCode }),
});

const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    logger.error("Email", "Missing RESEND_API_KEY environment variable");
    throw new Error("RESEND_API_KEY is required");
  }

  return new Resend(apiKey);
};

const getFromEmail = (): string => {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    logger.error("Email", "Missing RESEND_FROM_EMAIL environment variable");
    throw new Error("RESEND_FROM_EMAIL is required");
  }

  return fromEmail;
};

export const sendReactEmail = async (
  input: SendReactEmailInput,
): Promise<void> => {
  const logContext = {
    to: input.to,
    subject: input.subject,
    ...(input.emailType !== undefined && { emailType: input.emailType }),
  };

  if (!isEmailEnabled()) {
    logger.info("Email", "Email skipped — emails disabled in manifest", logContext);
    return;
  }

  const from = getFromEmail();
  const resend = getResendClient();
  const sendLogContext = { ...logContext, from };

  const result = await resend.emails
    .send({
      from,
      to: input.to,
      subject: input.subject,
      react: input.react,
    })
    .catch((error: unknown) => {
      logger.error("Email", "Resend request failed", {
        ...sendLogContext,
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    });

  const { data, error } = result;

  if (error) {
    logger.error("Email", "Resend API rejected email", {
      ...sendLogContext,
      ...getResendErrorMeta(error),
    });
    throw new Error(error.message);
  }

  logger.info("Email", "Email sent successfully", {
    ...sendLogContext,
    messageId: data?.id,
  });
};
