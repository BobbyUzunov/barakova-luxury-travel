import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale } from "./constants/i18n";
import {
  isKnownLocalizedPath,
  renderLocalizedNotFoundDocument,
} from "./lib/localized-not-found";

const legacyPrefixes = ["destinations", "cruises", "blog"] as const;

function localizedNotFound(locale: "bg" | "en") {
  return new NextResponse(renderLocalizedNotFoundDocument(locale), {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
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
    return isKnownLocalizedPath(pathname)
      ? NextResponse.next()
      : localizedNotFound(firstSegment);
  }

  if (!finalSegment?.includes(".")) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next).*)"],
};
