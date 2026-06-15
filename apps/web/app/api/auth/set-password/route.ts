import { NextResponse } from "next/server";

import { hashPasswordResetToken } from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { isValidPassword } from "@/lib/validation";

type SetPasswordRequestBody = {
  token?: string;
  password?: string;
};

export const POST = async (request: Request): Promise<NextResponse> => {
  const body = (await request.json()) as SetPasswordRequestBody;
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json(
      { error: "Ugyldigt eller udløbet link." },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Adgangskoden skal være mindst 8 tegn." },
      { status: 400 },
    );
  }

  const tokenHash = hashPasswordResetToken(token);

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: tokenHash },
    select: {
      id: true,
      passwordResetExpiresAt: true,
    },
  });

  if (
    !user?.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: "Ugyldigt eller udløbet link." },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return NextResponse.json({ success: true });
};
