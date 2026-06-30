import { cookies } from "next/headers";

import {
  AUTH_COOKIE_NAME,
  type AuthTokenPayload,
  verifyAuthToken,
} from "@/lib/auth-token";

export {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  signAuthToken,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth-token";

export const getSession = async (): Promise<AuthTokenPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
};

export const requireAdminSession = async (): Promise<AuthTokenPayload> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Ikke logget ind.");
  }

  if (session.role !== "ADMIN") {
    throw new Error("Ingen adgang.");
  }

  return session;
};
