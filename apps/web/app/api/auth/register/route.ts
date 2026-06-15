import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isValidEmail, isValidPassword } from "@/lib/validation";

type RegisterRequestBody = {
  email?: string;
  password?: string;
  name?: string;
};

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = (await request.json()) as RegisterRequestBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const name = body.name?.trim() || null;

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Angiv en gyldig e-mailadresse." },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Adgangskoden skal være mindst 8 tegn." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Der findes allerede en konto med denne e-mail." },
      { status: 409 },
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  const token = await signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    user,
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);

  return response;
};
