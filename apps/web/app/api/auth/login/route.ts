import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { isValidEmail } from "@/lib/validation";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = (await request.json()) as LoginRequestBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!isValidEmail(email) || !password) {
    return NextResponse.json(
      { error: "Ugyldig e-mail eller adgangskode." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
    },
  });

  if (!user?.password) {
    return NextResponse.json(
      { error: "Ugyldig e-mail eller adgangskode." },
      { status: 401 },
    );
  }

  const passwordMatches = await verifyPassword(password, user.password);

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Ugyldig e-mail eller adgangskode." },
      { status: 401 },
    );
  }

  const token = await signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);

  return response;
};
