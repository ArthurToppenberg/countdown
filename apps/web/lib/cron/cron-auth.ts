import { timingSafeEqual } from "node:crypto";

import { cronJsonResponse } from "@/lib/cron/cron-response";
import { logger } from "@/lib/logger";

export type CronAuthResult =
  | { ok: true }
  | { ok: false; response: ReturnType<typeof cronJsonResponse> };

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

export const authorizeCronRequest = (request: Request): CronAuthResult => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error("Cron", "Missing CRON_SECRET environment variable");
    return {
      ok: false,
      response: cronJsonResponse({ error: "Server misconfigured." }, { status: 500 }),
    };
  }

  if (!isAuthorized(request, cronSecret)) {
    return {
      ok: false,
      response: cronJsonResponse({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  return { ok: true };
};
