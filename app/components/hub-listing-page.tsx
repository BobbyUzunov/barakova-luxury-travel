import Link from "next/link";
import type { Locale } from "../../constants/content";
import { getSiteContent } from "../../constants/content-by-locale";
import { detailUi } from "../../constants/detail-ui";
import { hubPageCopy, type HubKind } from "../../constants/hub-pages";
import { localePath } from "../../constants/i18n";
import { BlogSection } from "../components/home/sections/blog-section";
import { CruisesSection } from "../components/home/sections/cruises-section";
import { DestinationsSection } from "../components/home/sections/destinations-section";
import { SiteFooter } from "../components/home/site-footer";

type HubListingPageProps = {
  kind: HubKind;
  locale: Locale;
};

export function HubListingPage({ kind, locale }: HubListingPageProps) {
  const content = getSiteContent(locale);
  const hub = hubPageCopy[locale][kind];

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="detail-header">
        <Link className="detail-brand" href={localePath(locale)}>
          <span>Barakova Luxury Travel</span>
          <small>{detailUi[locale].brandSubtitle}</small>
        </Link>
        <Link className="detail-back-link" href={localePath(locale)}>
          {hub.backLabel}
        </Link>
      </header>

      <div className="hub-page-intro px-5 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="hub-page-title">{hub.title}</h1>
          <p className="hub-page-description">{hub.description}</p>
        </div>
      </div>

      {kind === "destinations" ? (
        <DestinationsSection content={content} locale={locale} />
      ) : null}
      {kind === "cruises" ? (
        <CruisesSection content={content} locale={locale} />
      ) : null}
      {kind === "blog" ? <BlogSection content={content} locale={locale} /> : null}

      <SiteFooter content={content} locale={locale} />
    </main>
  );
}
