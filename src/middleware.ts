import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { cookies as NextCookies } from "next/headers";

import { AUTH_COOKIE_NAME, PATHNAME_HEADER } from "@/types";


export async function middleware(request: NextRequest) {
  let res = NextResponse.next();

  if (request.headers.get("accept") == "text/x-component")
    res = NextResponse.next();

  if (request.nextUrl.pathname === "/") {
    const cookies = await NextCookies();
    const token = cookies.get(AUTH_COOKIE_NAME);
    if (!token) {
      res = NextResponse.rewrite(new URL("/home", request.url));
    }
  }

  // Add a new header x-current-path which passes the path to downstream components
  res.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};