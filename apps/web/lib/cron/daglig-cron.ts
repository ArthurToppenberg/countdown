import {
  sendDagligEmailToActiveUsers,
  sendDagligEmailToAdminUsers,
  type DagligEmailBatchResult,
} from "@/lib/email/daglig-email";
import { cronJsonResponse } from "@/lib/cron/cron-response";
import { getCopenhagenHour } from "@/lib/minigame/copenhagen-date";
import { logger } from "@/lib/logger";

const SCHEDULED_COPENHAGEN_HOUR = 6;

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
  if (getCopenhagenHour(new Date()) !== SCHEDULED_COPENHAGEN_HOUR) {
    logger.info("Daglig", "Skipping cron send — not 6 AM Copenhagen time");
    return cronJsonResponse({ sent: false, reason: "outside-window" });
  }

  return runDagligEmailSend("all");
};

export const runDagligEmailToAllUsersCron = async (): Promise<
  ReturnType<typeof cronJsonResponse>
> => runDagligEmailSend("all");

export const runDagligEmailToAdminUsersCron = async (): Promise<
  ReturnType<typeof cronJsonResponse>
> => runDagligEmailSend("admin");
