import { createHash, randomBytes } from "node:crypto";

const PASSWORD_RESET_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7;

export type PasswordResetToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export const generatePasswordResetToken = (): PasswordResetToken => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  return {
    token,
    tokenHash,
    expiresAt,
  };
};

export const hashPasswordResetToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");
