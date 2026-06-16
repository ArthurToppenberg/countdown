import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(secret);
};

const gameSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const signGameSession = async <T extends Record<string, unknown>>(
  cookieName: string,
  payload: T,
  maxAgeSeconds = 60 * 60 * 24,
): Promise<void> => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    ...gameSessionCookieOptions,
    maxAge: maxAgeSeconds,
  });
};

export const readGameSession = async <T extends Record<string, unknown>>(
  cookieName: string,
): Promise<T | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch {
    return null;
  }
};

export const clearGameSession = async (cookieName: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", {
    ...gameSessionCookieOptions,
    maxAge: 0,
  });
};
