"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  buildSetPasswordUrl,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { logger } from "@/lib/logger";
import { generatePasswordResetToken } from "@/lib/password-reset";
import prisma from "@/lib/prisma";
import { type UserFormInput, parseUserForm } from "@/lib/user-validation";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

const revalidateUserPages = (): void => {
  revalidatePath("/admin/brugere");
};

export const createUser = async (
  input: UserFormInput,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const parsed = parseUserForm(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Der findes allerede en bruger med denne e-mail.",
    };
  }

  const { token, tokenHash, expiresAt } = generatePasswordResetToken();

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
        password: null,
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });
  } catch {
    return { success: false, error: "Kunne ikke oprette brugeren." };
  }

  try {
    await sendWelcomeEmail({
      to: parsed.data.email,
      name: parsed.data.name,
      setPasswordUrl: buildSetPasswordUrl(token),
    });
  } catch (error) {
    logger.error("Users", "Failed to send welcome email after user creation", {
      email: parsed.data.email,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    await prisma.user.delete({
      where: { email: parsed.data.email },
    });

    return {
      success: false,
      error: "Kunne ikke sende velkomst-e-mailen. Prøv igen.",
    };
  }

  revalidateUserPages();
  return { success: true };
};

export const updateUser = async (
  id: string,
  input: UserFormInput,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const parsed = parseUserForm(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingUser) {
    return { success: false, error: "Brugeren findes ikke." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
      NOT: { id },
    },
    select: { id: true },
  });

  if (emailTaken) {
    return {
      success: false,
      error: "Der findes allerede en bruger med denne e-mail.",
    };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: parsed.data,
    });
  } catch {
    return { success: false, error: "Kunne ikke opdatere brugeren." };
  }

  revalidateUserPages();
  return { success: true };
};

export const resetUserPassword = async (id: string): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return { success: false, error: "Brugeren findes ikke." };
  }

  const { token, tokenHash, expiresAt } = generatePasswordResetToken();

  try {
    await prisma.user.update({
      where: { id },
      data: {
        password: null,
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });
  } catch {
    return {
      success: false,
      error: "Kunne ikke nulstille adgangskoden.",
    };
  }

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      setPasswordUrl: buildSetPasswordUrl(token),
    });
  } catch (error) {
    logger.error("Users", "Failed to send password reset email", {
      userId: user.id,
      email: user.email,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    return {
      success: false,
      error: "Adgangskoden blev nulstillet, men e-mailen kunne ikke sendes.",
    };
  }

  return { success: true };
};

export const deleteUser = async (id: string): Promise<ActionResult> => {
  let session;

  try {
    session = await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  if (session.userId === id) {
    return {
      success: false,
      error: "Du kan ikke slette din egen bruger.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingUser) {
    return { success: false, error: "Brugeren findes ikke." };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch {
    return { success: false, error: "Kunne ikke slette brugeren." };
  }

  revalidateUserPages();
  return { success: true };
};
