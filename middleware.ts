import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("admin_auth")?.value;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (sessionSecret && session === sessionSecret) {
      return NextResponse.redirect(new URL("/admin/orders", request.url));
    }

    return NextResponse.next();
  }

  const session = request.cookies.get("admin_auth")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret || session !== sessionSecret) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};