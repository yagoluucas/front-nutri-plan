import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout realizado com sucesso.",
  });

  response.cookies.set(AUTH_TOKEN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
