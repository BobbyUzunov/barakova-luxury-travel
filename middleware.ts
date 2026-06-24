import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale } from "./constants/i18n";

const legacyPrefixes = ["destinations", "cruises", "blog"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  if (pathname === "/privacy") {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/privacy`, request.url),
    );
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment === "bg" || firstSegment === "en") {
    return NextResponse.next();
  }

  for (const prefix of legacyPrefixes) {
    if (pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`)) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}${pathname}`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/privacy", "/destinations/:path*", "/cruises/:path*", "/blog/:path*"],
};
