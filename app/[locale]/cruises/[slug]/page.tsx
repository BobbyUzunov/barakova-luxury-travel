import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailPage } from "../../../content-detail-page";
import { detailUi } from "../../../../constants/detail-ui";
import type { Locale } from "../../../../constants/content";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  localizedHash,
} from "../../../../constants/i18n";
import { findSeoCruise, getSeoCruises } from "../../../../constants/seo-content";
import { siteUrl } from "../../../../constants/site";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoCruises("bg").flatMap((cruise) => [
    { locale: "bg", slug: cruise.slug },
    { locale: "en", slug: cruise.slug },
  ]);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const cruise = findSeoCruise(locale, slug);

  if (!cruise) {
    return {};
  }

  const title =
    locale === "bg"
      ? `${cruise.name} – премиум круиз | Barakova Luxury Travel`
      : `${cruise.name} – premium cruise | Barakova Luxury Travel`;
  const description = cruise.detail;
  const canonical = localePath(locale, `/cruises/${cruise.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages(`/cruises/${cruise.slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      locale: locale === "bg" ? "bg_BG" : "en_US",
      images: [{ url: cruise.image, alt: cruise.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cruise.image],
    },
  };
}

export default async function CruisePage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const cruise = findSeoCruise(locale, slug);
  const copy = detailUi[locale].cruise;

  if (!cruise) {
    notFound();
  }

  const pageUrl = `${siteUrl}${localePath(locale, `/cruises/${cruise.slug}`)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: cruise.name,
    description: cruise.detail,
    image: cruise.gallery,
    url: pageUrl,
    touristType: "Luxury cruise",
    inLanguage: locale,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <ContentDetailPage
        backHref={localizedHash(locale, copy.backHash)}
        backLabel={copy.backLabel}
        contactHref={localizedHash(locale, "#contact")}
        ctaLabel={copy.ctaLabel}
        eyebrow={copy.eyebrow}
        galleryPhotoLabel={copy.galleryPhotoLabel}
        galleryTitle={copy.galleryTitle}
        highlightsTitle={copy.highlightsTitle}
        homeHref={localePath(locale)}
        item={cruise}
        locale={locale}
      />
    </>
  );
}
