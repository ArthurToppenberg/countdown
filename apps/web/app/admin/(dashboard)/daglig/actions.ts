"use server";

import { revalidatePath } from "next/cache";

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
      dagligEmailOptIn: true,
    },
  });

  if (!user) {
    return { success: false, error: "Bruger ikke fundet." };
  }

  if (!user.dagligEmailOptIn) {
    return {
      success: false,
      error: "Bruger er ikke tilmeldt daglig e-mail.",
    };
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

export const setDagligEmailOptIn = async (
  userId: string,
  optIn: boolean,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { dagligEmailOptIn: optIn },
    });
  } catch (error) {
    logger.error("Daglig", "Failed to update email opt-in", {
      userId,
      optIn,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: "Kunne ikke opdatere e-mail-tilmelding.",
    };
  }

  logger.info("Daglig", "Email opt-in updated", { userId, optIn });

  revalidatePath("/admin/daglig");

  return { success: true };
};
