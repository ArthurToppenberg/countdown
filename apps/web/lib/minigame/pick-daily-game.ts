import { createHash } from "node:crypto";

const getDailyMinigameSalt = (): string => {
  const salt = process.env.DAILY_MINIGAME_SALT ?? process.env.JWT_SECRET;

  if (!salt) {
    throw new Error("DAILY_MINIGAME_SALT or JWT_SECRET is required for daily minigame selection");
  }

  return salt;
};

export const pickGameForDate = (
  copenhagenDateKey: string,
  activeGameIds: readonly string[],
): string => {
  if (activeGameIds.length === 0) {
    throw new Error("No active minigames available for daily selection");
  }

  const sortedGameIds = [...activeGameIds].sort((left, right) =>
    left.localeCompare(right),
  );
  const hash = createHash("sha256")
    .update(`${copenhagenDateKey}:${getDailyMinigameSalt()}`)
    .digest();
  const index = hash.readUInt32BE(0) % sortedGameIds.length;

  return sortedGameIds[index];
};
