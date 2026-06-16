"use server";

import { requireAdminSession } from "@/lib/auth";
import { sendDagligEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export const sendDagligEmailToUser = async (
  userId: string,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
    },
  });

  if (!user) {
    return { success: false, error: "Bruger ikke fundet." };
  }

  if (!user.name?.trim()) {
    return {
      success: false,
      error: "Bruger mangler navn — kan ikke sende daglig e-mail.",
    };
  }

  try {
    await sendDagligEmail({
      to: user.email,
      name: user.name,
    });
  } catch (error) {
    logger.error("Daglig", "Failed to send daily email", {
      userId,
      email: user.email,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Kunne ikke sende daglig e-mail.",
    };
  }

  logger.info("Daglig", "Daily email sent", {
    userId,
    email: user.email,
  });

  return { success: true };
};
