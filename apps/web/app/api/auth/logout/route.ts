import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

export const POST = async (): Promise<NextResponse> => {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
};
