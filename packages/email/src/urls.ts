const getAppUrl = (): string => {
  const appUrl =
    process.env.APP_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

  if (!appUrl) {
    throw new Error("APP_URL is required in production");
  }

  return appUrl.replace(/\/$/, "");
};

export const buildSetPasswordUrl = (token: string): string =>
  `${getAppUrl()}/set-password?token=${encodeURIComponent(token)}`;

export const buildGameUrl = (): string => `${getAppUrl()}/game`;
