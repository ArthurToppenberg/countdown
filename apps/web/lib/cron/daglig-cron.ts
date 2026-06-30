import {
  sendDagligEmailToActiveUsers,
  sendDagligEmailToAdminUsers,
  type DagligEmailBatchResult,
} from "@/lib/email/daglig-email";
import { sendChampionEmailsForNewlyCrowned } from "@/lib/email/champion-email";
import { cronJsonResponse } from "@/lib/cron/cron-response";
import { getCopenhagenMinutesSinceMidnight } from "@/lib/game/copenhagen-date";
import { logger } from "@/lib/logger";

const SCHEDULED_COPENHAGEN_HOUR = 6;
const SCHEDULED_COPENHAGEN_MINUTES = SCHEDULED_COPENHAGEN_HOUR * 60;
const MAX_LATENESS_MINUTES = 3 * 60;

type DagligCronAudience = "all" | "admin";

const runDagligEmailSend = async (
  audience: DagligCronAudience,
): Promise<ReturnType<typeof cronJsonResponse>> => {
  try {
    const result: DagligEmailBatchResult =
      audience === "admin"
        ? await sendDagligEmailToAdminUsers()
        : await sendDagligEmailToActiveUsers();

    logger.info("Daglig", "Cron daily email batch finished", {
      audience,
      sent: result.sent,
      failed: result.failed.length,
    });

    return cronJsonResponse({
      audience,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    logger.error("Daglig", "Cron daily email batch failed", {
      audience,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return cronJsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Kunne ikke sende daglig e-mail.",
      },
      { status: 500 },
    );
  }
};

export const runScheduledDagligCron = async (): Promise<
  ReturnType<typeof cronJsonResponse>
> => {
  const latenessMinutes =
    getCopenhagenMinutesSinceMidnight(new Date()) - SCHEDULED_COPENHAGEN_MINUTES;

  if (latenessMinutes < 0) {
    logger.info("Daglig", "Skipping cron send — before 6 AM Copenhagen time", {
      latenessMinutes,
    });
    return cronJsonResponse({ sent: false, reason: "outside-window" });
  }

  if (latenessMinutes > MAX_LATENESS_MINUTES) {
    logger.error("Daglig", "Rejecting cron send — more than 3 hours late", {
      latenessMinutes,
      maxLatenessMinutes: MAX_LATENESS_MINUTES,
    });
    return cronJsonResponse(
      {
        error: `Daglig e-mail afvist: ${latenessMinutes} minutter forsinket (maks. ${MAX_LATENESS_MINUTES}).`,
      },
      { status: 500 },
    );
  }

  await crownNewlyLockedSeason();

  return runDagligEmailSend("all");
};

const crownNewlyLockedSeason = async (): Promise<void> => {
  try {
    const result = await sendChampionEmailsForNewlyCrowned();

    if (result.festivalName) {
      logger.info("Daglig", "Crowning email batch finished", {
        festivalName: result.festivalName,
        sent: result.sent,
        failed: result.failed.length,
      });
    }
  } catch (error) {
    logger.error("Daglig", "Crowning email batch failed", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
};

export const runDagligEmailToAllUsersCron = async (): Promise<
  ReturnType<typeof cronJsonResponse>
> => runDagligEmailSend("all");

export const runDagligEmailToAdminUsersCron = async (): Promise<
  ReturnType<typeof cronJsonResponse>
> => runDagligEmailSend("admin");
