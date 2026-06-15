"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  type EventFormInput,
  parseEventForm,
} from "@/lib/event-validation";
import prisma from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

const revalidateEventPages = (): void => {
  revalidatePath("/admin/events");
  revalidatePath("/");
};

export const createEvent = async (
  input: EventFormInput,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const parsed = parseEventForm(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  try {
    await prisma.event.create({
      data: parsed.data,
    });
  } catch {
    return { success: false, error: "Kunne ikke oprette begivenheden." };
  }

  revalidateEventPages();
  return { success: true };
};

export const updateEvent = async (
  id: string,
  input: EventFormInput,
): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  const parsed = parseEventForm(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: parsed.data,
    });
  } catch {
    return { success: false, error: "Kunne ikke opdatere begivenheden." };
  }

  revalidateEventPages();
  return { success: true };
};

export const deleteEvent = async (id: string): Promise<ActionResult> => {
  try {
    await requireAdminSession();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ingen adgang.",
    };
  }

  try {
    await prisma.event.delete({
      where: { id },
    });
  } catch {
    return { success: false, error: "Kunne ikke slette begivenheden." };
  }

  revalidateEventPages();
  return { success: true };
};
