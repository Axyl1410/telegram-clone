import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const url = new URL(request.url);
  const pathname = url.pathname;

  // If user is authenticated, prevent access to auth pages
  if (session) {
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If user is not authenticated, protect the home page
  if (!pathname.startsWith("/sign-in") && !pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/", "/sign-in", "/sign-up"],
};
