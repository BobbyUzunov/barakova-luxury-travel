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
import { findSeoDestination, getSeoDestinations } from "../../../../constants/seo-content";
import { siteUrl } from "../../../../constants/site";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoDestinations("bg")
    .flatMap((destination) => [
      { locale: "bg", slug: destination.slug },
      { locale: "en", slug: destination.slug },
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
  const destination = findSeoDestination(locale, slug);

  if (!destination) {
    return {};
  }

  const title =
    locale === "bg"
      ? `${destination.name} – луксозно пътуване | Barakova Luxury Travel`
      : `${destination.name} – luxury travel | Barakova Luxury Travel`;
  const description = destination.detail;
  const canonical = localePath(locale, `/destinations/${destination.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages(`/destinations/${destination.slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      locale: locale === "bg" ? "bg_BG" : "en_US",
      images: [{ url: destination.image, alt: destination.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [destination.image],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const destination = findSeoDestination(locale, slug);
  const copy = detailUi[locale].destination;

  if (!destination) {
    notFound();
  }

  const pageUrl = `${siteUrl}${localePath(locale, `/destinations/${destination.slug}`)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.detail,
    image: destination.gallery,
    url: pageUrl,
    touristType: "Luxury travel",
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
        item={destination}
        locale={locale}
      />
    </>
  );
}
