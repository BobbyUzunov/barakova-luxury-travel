"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { detailUi } from "../constants/detail-ui";
import { defaultLocale, isLocale, localePath } from "../constants/i18n";

function getLocaleFromPathname(pathname: string | null) {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];

  if (firstSegment && isLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

export default function NotFound() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const copy = detailUi[locale].notFound;

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <Link className="btn-primary" href={localePath(locale)}>
          {copy.homeLabel}
        </Link>
      </div>
    </main>
  );
}
