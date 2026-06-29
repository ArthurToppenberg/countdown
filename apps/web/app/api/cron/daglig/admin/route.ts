import { NextResponse } from "next/server";

import { authorizeCronRequest } from "@/lib/cron/cron-auth";
import { runDagligEmailToAdminUsersCron } from "@/lib/cron/daglig-cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request): Promise<NextResponse> => {
  const auth = authorizeCronRequest(request);

  if (!auth.ok) {
    return auth.response;
  }

  return runDagligEmailToAdminUsersCron();
};
