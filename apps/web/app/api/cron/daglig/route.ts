import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getActiveEvent } from "@/lib/active-event";
import { sendDagligEmailToActiveUsers } from "@/lib/email/daglig-email";
import { getCopenhagenHour } from "@/lib/minigame/copenhagen-date";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEDULED_COPENHAGEN_HOUR = 6;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

const jsonResponse = (
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse =>
  NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...init?.headers,
    },
  });

const isAuthorized = (request: Request, secret: string): boolean => {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return false;
  }

  const provided = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
};

const isForced = (request: Request): boolean =>
  new URL(request.url).searchParams.get("force") === "true";

export const POST = async (request: Request): Promise<NextResponse> => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error("Daglig", "Missing CRON_SECRET environment variable");
    return jsonResponse({ error: "Server misconfigured." }, { status: 500 });
  }

  if (!isAuthorized(request, cronSecret)) {
    return jsonResponse({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isForced(request) && getCopenhagenHour(new Date()) !== SCHEDULED_COPENHAGEN_HOUR) {
    logger.info("Daglig", "Skipping cron send — not 6 AM Copenhagen time");
    return jsonResponse({ sent: false, reason: "outside-window" });
  }

  const activeEvent = await getActiveEvent();

  if (activeEvent) {
    logger.info("Daglig", "Skipping cron send — active event in progress", {
      eventId: activeEvent.id,
      eventName: activeEvent.name,
    });
    return jsonResponse({ sent: false, reason: "active-event" });
  }

  try {
    const result = await sendDagligEmailToActiveUsers();

    logger.info("Daglig", "Cron daily email batch finished", {
      sent: result.sent,
      failed: result.failed.length,
    });

    return jsonResponse({
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    logger.error("Daglig", "Cron daily email batch failed", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse(
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
