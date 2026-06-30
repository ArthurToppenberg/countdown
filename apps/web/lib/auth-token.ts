import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth-token";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(secret);
};

export const signAuthToken = async (
  payload: AuthTokenPayload,
): Promise<string> => {
  const secret = getJwtSecret();

  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};

export const verifyAuthToken = async (
  token: string,
): Promise<AuthTokenPayload | null> => {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const role = payload.role;

    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      (role !== "ADMIN" && role !== "USER")
    ) {
      return null;
    }

    return {
      userId,
      email,
      name: typeof name === "string" ? name : null,
      role,
    };
  } catch {
    return null;
  }
};

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
