import type { Metadata } from "next";
import { headers } from "next/headers";
import { detailUi } from "../constants/detail-ui";
import { localePath } from "../constants/i18n";
import { getLocaleFromHeaders } from "../lib/request-locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | Barakova Luxury Travel",
};

export default async function GlobalNotFound() {
  const requestHeaders = await headers();
  const locale = getLocaleFromHeaders((name) => requestHeaders.get(name));
  const copy = detailUi[locale].notFound;

  return (
    <html lang={locale}>
      <body>
        <main className="not-found-page">
          <div className="not-found-card">
            <p className="not-found-code">404</p>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
            <a className="btn-primary" href={localePath(locale)}>
              {copy.homeLabel}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
