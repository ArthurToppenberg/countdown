export const requireUserName = (
  name: string | null | undefined,
  message = "Bruger mangler navn",
): string => {
  const trimmed = name?.trim();

  if (!trimmed) {
    throw new Error(message);
  }

  return trimmed;
};
