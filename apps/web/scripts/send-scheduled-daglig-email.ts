import { getCopenhagenHour } from "../lib/minigame/copenhagen-date";
import { sendDagligEmail } from "../lib/email/daglig-email";
import { logger } from "../lib/logger";

const RECIPIENT_EMAIL = "Arthur.toppenberg@gmail.com";
const RECIPIENT_NAME = "Arthur";
const SCHEDULED_COPENHAGEN_HOUR = 6;

const shouldSendNow = (): boolean => {
  if (process.env.FORCE_SEND === "true") {
    return true;
  }

  return getCopenhagenHour(new Date()) === SCHEDULED_COPENHAGEN_HOUR;
};

const main = async (): Promise<void> => {
  if (!shouldSendNow()) {
    logger.info("Daglig", "Skipping scheduled send — not 6 AM Copenhagen time");
    return;
  }

  await sendDagligEmail({
    to: RECIPIENT_EMAIL,
    name: RECIPIENT_NAME,
  });

  logger.info("Daglig", "Scheduled daily email sent", {
    email: RECIPIENT_EMAIL,
  });
};

main().catch((error: unknown) => {
  logger.error("Daglig", "Scheduled daily email failed", {
    errorMessage: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
