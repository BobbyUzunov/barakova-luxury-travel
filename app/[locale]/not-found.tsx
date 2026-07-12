"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { detailUi } from "../../constants/detail-ui";
import { defaultLocale, isLocale, localePath } from "../../constants/i18n";

export default function LocaleNotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale && isLocale(params.locale)
    ? params.locale
    : defaultLocale;
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
