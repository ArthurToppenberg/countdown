import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { sendDagligEmail } from "@/lib/email/daglig-email";
import { getCopenhagenHour } from "@/lib/minigame/copenhagen-date";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECIPIENT_EMAIL = "Arthur.toppenberg@gmail.com";
const RECIPIENT_NAME = "Arthur";
const SCHEDULED_COPENHAGEN_HOUR = 6;

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
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isForced(request) && getCopenhagenHour(new Date()) !== SCHEDULED_COPENHAGEN_HOUR) {
    logger.info("Daglig", "Skipping cron send — not 6 AM Copenhagen time");
    return NextResponse.json({ sent: false, reason: "outside-window" });
  }

  try {
    await sendDagligEmail({ to: RECIPIENT_EMAIL, name: RECIPIENT_NAME });
  } catch (error) {
    logger.error("Daglig", "Cron daily email failed", {
      email: RECIPIENT_EMAIL,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke sende daglig e-mail." },
      { status: 500 },
    );
  }

  logger.info("Daglig", "Cron daily email sent", { email: RECIPIENT_EMAIL });

  return NextResponse.json({ sent: true });
};
