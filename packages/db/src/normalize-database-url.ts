const legacySslModes = new Set(["prefer", "require", "verify-ca"]);

export const normalizeDatabaseUrl = (url: string): string => {
  const parsed = new URL(url);
  const sslMode = parsed.searchParams.get("sslmode");

  if (sslMode && legacySslModes.has(sslMode)) {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return parsed.toString();
};
