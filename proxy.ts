import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale } from "./constants/i18n";

const legacyPrefixes = ["destinations", "cruises", "blog"] as const;

function continueWithLocale(request: NextRequest, locale: "bg" | "en") {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  if (pathname === "/privacy") {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/privacy`, request.url),
    );
  }

  for (const prefix of legacyPrefixes) {
    if (pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`)) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}${pathname}`, request.url),
      );
    }
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const finalSegment = pathname.split("/").filter(Boolean).at(-1);

  if (firstSegment === "bg" || firstSegment === "en") {
    return continueWithLocale(request, firstSegment);
  }

  if (
    !finalSegment?.includes(".")
  ) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next).*)"],
};
