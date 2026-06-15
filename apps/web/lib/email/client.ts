import { Resend } from "resend";

import { logger } from "@/lib/logger";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
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

export const sendEmail = async (input: SendEmailInput): Promise<void> => {
  const from = getFromEmail();
  const resend = getResendClient();
  const logContext = {
    to: input.to,
    subject: input.subject,
    from,
    ...(input.emailType !== undefined && { emailType: input.emailType }),
  };

  let result;

  try {
    result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (error) {
    logger.error("Email", "Resend request failed", {
      ...logContext,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const { data, error } = result;

  if (error) {
    logger.error("Email", "Resend API rejected email", {
      ...logContext,
      ...getResendErrorMeta(error),
    });
    throw new Error(error.message);
  }

  logger.info("Email", "Email sent successfully", {
    ...logContext,
    messageId: data?.id,
  });
};
