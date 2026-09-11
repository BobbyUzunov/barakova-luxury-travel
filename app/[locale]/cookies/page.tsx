import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { detailUi } from "../../../constants/detail-ui";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  locales,
} from "../../../constants/i18n";
import { privacyContent } from "../../../constants/privacy";
import { siteName } from "../../../constants/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const cookiesPageCopy = {
  bg: {
    pageTitle: "Политика за бисквитки",
    backLabel: "Обратно към началото",
    intro:
      "Тази страница описва кои бисквитки и външни технологии използва Barakova Luxury Travel и кога се активират.",
    privacyCta: "Пълна политика за поверителност",
  },
  en: {
    pageTitle: "Cookie policy",
    backLabel: "Back to home",
    intro:
      "This page explains which cookies and third-party technologies Barakova Luxury Travel uses and when they are activated.",
    privacyCta: "Full privacy policy",
  },
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = cookiesPageCopy[localeParam];
  const canonical = localePath(localeParam, "/cookies");

  return {
    title: `${copy.pageTitle} | ${siteName}`,
    description: copy.intro,
    alternates: {
      canonical,
      languages: getAlternateLanguages("/cookies"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const copy = cookiesPageCopy[localeParam];
  const privacy = privacyContent[localeParam];
  const cookiesSection = privacy.sections.find(
    (section) => section.id === "cookies",
  );

  if (!cookiesSection) {
    notFound();
  }

  return (
    <main className="privacy-page">
      <header className="detail-header">
        <Link className="detail-brand" href={localePath(localeParam)}>
          <span>Barakova Luxury Travel</span>
          <small>{detailUi[localeParam].brandSubtitle}</small>
        </Link>
        <Link className="detail-back-link" href={localePath(localeParam)}>
          {copy.backLabel}
        </Link>
      </header>

      <article className="privacy-content">
        <p className="privacy-updated">{privacy.lastUpdated}</p>
        <h1>{copy.pageTitle}</h1>
        <p className="privacy-intro">{copy.intro}</p>

        <section id="cookies">
          <h2>{cookiesSection.title}</h2>
          {cookiesSection.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="privacy-locale-note">
          <Link
            className="detail-back-link"
            href={localePath(localeParam, "/privacy")}
          >
            {copy.privacyCta}
          </Link>
        </section>
      </article>
    </main>
  );
}
