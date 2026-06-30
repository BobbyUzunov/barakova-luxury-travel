import Link from "next/link";
import { notFound } from "next/navigation";
import { privacyContent } from "../../../constants/privacy";
import { detailUi } from "../../../constants/detail-ui";
import { isLocale, localePath } from "../../../constants/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const content = privacyContent[localeParam];
  const secondaryLocale = localeParam === "bg" ? "en" : "bg";

  return (
    <main className="privacy-page">
      <header className="detail-header">
        <Link className="detail-brand" href={localePath(localeParam)}>
          <span>Barakova Luxury Travel</span>
          <small>{detailUi[localeParam].brandSubtitle}</small>
        </Link>
        <Link className="detail-back-link" href={localePath(localeParam)}>
          {content.backLabel}
        </Link>
      </header>

      <article className="privacy-content">
        <p className="privacy-updated">{content.lastUpdated}</p>
        <h1>{content.pageTitle}</h1>
        <p className="privacy-intro">{content.intro}</p>

        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section className="privacy-locale-note">
          <h2>{content.otherLocaleTitle}</h2>
          <Link
            className="detail-back-link"
            href={localePath(secondaryLocale, "/privacy")}
          >
            {content.otherLocaleLink}
          </Link>
        </section>
      </article>
    </main>
  );
}
